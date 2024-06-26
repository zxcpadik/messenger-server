import { generate } from "randomstring";
import { Token } from "../entities/token";
import { User } from "../entities/user";
import { TokenRepo, UserRepo } from "./db-service";
import { AuthResultCode, RegisterResultCode, SetUserInfoResultCode, UserInfoResultCode } from "../declarations/enums";

const UsernameCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZЯЮЭЬЫЪЩШЧЦХФУТСРПОНМЛКЙИЗЖЁЕДГВБАabcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя1234567890_";
const PasswordCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZЯЮЭЬЫЪЩШЧЦХФУТСРПОНМЛКЙИЗЖЁЕДГВБАabcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя1234567890_!\"@ $%&/()=?\'`*+~#-_.,;:{[]}\<(><<)><(>><)>|';
export function TestUsernameLegal(username?: string): boolean {
  if (username == undefined || username.length < 6 || username.length > 64) return false;
  username = username.toLowerCase();
  for (let c of username) {
    if (!UsernameCharset.includes(c)) return false;
  }
  return true;
}
export function TestPasswordLegal(password?: string): boolean {
  if (password == undefined || password.length < 8 || password.length > 128) return false;
  for (let c of password) {
    if (!PasswordCharset.includes(c)) return false;
  }
  return true;
}

export module TokenManager {
  export async function AuthToken(token?: string): Promise<number | undefined> {
    const Token = await TokenRepo.findOneBy({ hash: token });
    if (Token == null) return;
    if (Token.IsDecayed()) return;
    return Token.UserID;
  }
  export async function GenerateToken(UserID: number): Promise<Token> {
    var token = new Token();
    token.hash = generate(64);
    token.Renew();
    token.UserID = UserID;
    return TokenRepo.save(token);
  }
}

export module AuthService {
  export async function AuthUser(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      if (credentials.username == undefined || credentials.password == undefined) return new AuthResult(false, AuthResultCode.NullParameter);

      if (!TestUsernameLegal(credentials.username)) return new AuthResult(false, AuthResultCode.UsernameFormat);
      if (!TestPasswordLegal(credentials.password)) return new AuthResult(false, AuthResultCode.PasswordFormat);

      const usr = await UserRepo.findOneBy({ Username: credentials.username });
      if (usr == null) return new AuthResult(false, AuthResultCode.UserNotExists);

      const passValid = usr.ComparePassword(credentials.password);
      if (!passValid) return new AuthResult(false, AuthResultCode.PasswordIncorrect);

      const Token = await TokenManager.GenerateToken(usr.UserID);
      return new AuthResult(true, AuthResultCode.Success, Token.hash);
    } catch (err) {
      console.log(`[ERROR] AuthService::AuthUser\n${err}`);
      return new AuthResult(false, AuthResultCode.InternalError);
    }
  }
  export async function RegisterUser(credentials: AuthCredentials, IP: string, nickname: string = generate(8)): Promise<RegistrationResult> {
    try {
      if (credentials.username == undefined || credentials.password == undefined) return new RegistrationResult(false, RegisterResultCode.NullParameter);

      if (!TestUsernameLegal(credentials.username)) return new RegistrationResult(false, RegisterResultCode.UsernameFormat);
      if (!TestPasswordLegal(credentials.password)) return new RegistrationResult(false, RegisterResultCode.PasswordFormat);
      if (!TestUsernameLegal(nickname)) return new RegistrationResult(false, RegisterResultCode.NicknameFormat);

      if (await UserRepo.existsBy({ Username: credentials.username })) return new RegistrationResult(false, RegisterResultCode.UserAlreadyExists);
      if (nickname != undefined && await UserRepo.existsBy({ nickname: nickname })) return new RegistrationResult(false, RegisterResultCode.NicknameBusy);

      const usr = new User();
      usr.IPAddress = IP;
      usr.UpdatePassword(credentials.password);
      usr.Username = credentials.username;
      usr.nickname = nickname;
      const res = await UserRepo.save(usr);

      const Token = await TokenManager.GenerateToken(res.UserID);
    return new RegistrationResult(true, RegisterResultCode.Success, Token.hash);
    } catch (err) {
      console.log(`[ERROR] AuthService::RegisterUser\n${err}`);
      return new RegistrationResult(false, RegisterResultCode.InternalError);
    }
  }
  export async function GetInfo(token?: string) {
    try {
      if (token == undefined) return new UserInfoResult(false, UserInfoResultCode.NullParameter);

      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new UserInfoResult(false, UserInfoResultCode.NoAuth);
  
      let usr = await UserRepo.findOneBy({ UserID: UserID });
  
      let userinfo = new UserInfoObj();
      userinfo.creationdate = usr?.CreationDate;
      userinfo.nickname = usr?.nickname;
  
      return new UserInfoResult(true, UserInfoResultCode.Success, userinfo);
    } catch (err) {
      console.log(`[ERROR] AuthService::GetInfo\n${err}`);
      return new UserInfoResult(false, UserInfoResultCode.InternalError);
    }
  }
  export async function SetInfo(token?: string, nickname?: string): Promise<SetUserInfoResult> {
    try {
      if (token == undefined || nickname == undefined) return new SetUserInfoResult(false, SetUserInfoResultCode.NullParameter);

      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new SetUserInfoResult(false, SetUserInfoResultCode.NoAuth);

      if (!TestUsernameLegal(nickname)) return new SetUserInfoResult(false, SetUserInfoResultCode.NicknameFormat);
      if (await UserRepo.existsBy({ nickname: nickname })) return new SetUserInfoResult(false, SetUserInfoResultCode.NicknameBusy);

      await UserRepo.update({ UserID: UserID }, { nickname: nickname });
      return new SetUserInfoResult(true, SetUserInfoResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] AuthService::SetInfo\n${err}`);
      return new SetUserInfoResult(false, SetUserInfoResultCode.InternalError);
    }
  }
}

export class AuthCredentials {
  public username?: string;
  public password?: string;

  constructor (username?: string, password?: string) {
    this.username = username;
    this.password = password;
  }
}

export class AuthResult {
  public ok: boolean;
  public status: number;
  public token?: string;

  constructor (ok: boolean, status: number, token?: string) {
    this.ok = ok;
    this.status = status;
    this.token = token;
  }
}
export class RegistrationResult {
  public ok: boolean;
  public status: number;
  public token?: string;

  constructor (ok: boolean, status: number, token?: string) {
    this.ok = ok;
    this.status = status;
    this.token = token;
  }
}
export class UserInfoResult {
  public ok: boolean;
  public status: number;
  public info?: UserInfoObj;

  constructor (ok: boolean, status: number, info?: UserInfoObj) {
    this.ok = ok;
    this.status = status;
    this.info = info;
  }
}
export class SetUserInfoResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}

export class UserInfoObj {
  public nickname?: string;
  public creationdate?: Date;
}