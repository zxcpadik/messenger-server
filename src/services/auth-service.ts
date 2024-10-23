import { generate } from "randomstring";
import { Token } from "../entities/token";
import { User } from "../entities/user";
import { TokenRepo, UserRepo } from "./db-service";
import { AuthResultCode, ConfirmAuth2FAResultCode, ConfirmEnable2FAResultCode, Disable2FAResultCode, Enable2FAResultCode, RegisterResultCode, SetUserInfoResultCode, UserInfoResultCode } from "../declarations/enums";
import { SessionManager } from "./session-manager";
import { StatusCodes } from "http-status-codes";

const UsernameCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZЯЮЭЬЫЪЩШЧЦХФУТСРПОНМЛКЙИЗЖЁЕДГВБАabcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя1234567890_";
const PasswordCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZЯЮЭЬЫЪЩШЧЦХФУТСРПОНМЛКЙИЗЖЁЕДГВБАabcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя1234567890_!\"@ $%&/()=?\'`*+~#-_.,;:{[]}\<(><<)><(>><)>|';
export function TestUsernameLegal(username?: string): boolean {
  if (username == undefined || username.length < 6 || username.length > 32) return false;
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

export namespace TokenManager {
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
  setInterval(async () => {
    try {
      var sr = await TokenRepo.find();
      for (let si = 0; si < sr.length; si++) {
        if (sr[si].IsDecayed()) TokenRepo.remove(sr[si]);
      }
    } catch (err) {
      console.log(`[ERROR] TokenManager::Remover`);
    }
  }, 180000);
}

export namespace AuthService {
  export async function AuthUser(credentials: AuthCredentials, hash: string, ip: string): Promise<AuthResult> {
    try {
      if (credentials.username == undefined || credentials.password == undefined) return new AuthResult(false, AuthResultCode.NullParameter);

      if (!TestUsernameLegal(credentials.username)) return new AuthResult(false, AuthResultCode.UsernameFormat);
      if (!TestPasswordLegal(credentials.password)) return new AuthResult(false, AuthResultCode.PasswordFormat);

      credentials.username = credentials.username.toLowerCase();

      const usr = await UserRepo.findOneBy({ Username: credentials.username});
      if (usr == null) return new AuthResult(false, AuthResultCode.UserNotExists);

      const passValid = usr.ComparePassword(credentials.password);
      if (!passValid) return new AuthResult(false, AuthResultCode.PasswordIncorrect);

      if (usr.totpenabled) {
        SessionManager.AuthSession(hash, ip, usr.UserID);
        return new AuthResult(false, AuthResultCode.TOTPRequest);
      }

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

      credentials.username = credentials.username.toLowerCase();

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
  export async function Enable2FA(token?: string): Promise<Enable2FAResult> {
    try {
      if (token == undefined) return new Enable2FAResult(false, Enable2FAResultCode.NullParameter);

      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new Enable2FAResult(false, Enable2FAResultCode.NoAuth);
      const usr = await UserRepo.findOneBy({ UserID: UserID });
      if (usr?.totpenabled) return new Enable2FAResult(false, Enable2FAResultCode.AlreadyEnabled);

      const key = generate({ length: 16, charset: 'abcdefghijklmnopqrstuvwxyz234567' });
      await UserRepo.update({ UserID: UserID }, { totpkey: key });
      return new Enable2FAResult(true, Enable2FAResultCode.Success, key);
    } catch (err) {
      console.log(`[ERROR] AuthService::Enable2FA\n${err}`);
      return new Enable2FAResult(false, Enable2FAResultCode.InternalError);
    }
  }
  export async function ConfirmEnable2FA(token?: string, code?: string): Promise<ConfirmEnable2FAResult> {
    try {
      if (token == undefined || code == undefined) return new ConfirmEnable2FAResult(false, ConfirmEnable2FAResultCode.NullParameter);

      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new ConfirmEnable2FAResult(false, ConfirmEnable2FAResultCode.NoAuth);

      const usr = await UserRepo.findOneBy({ UserID: UserID });
      if (usr?.totpkey == "") return new ConfirmEnable2FAResult(false, ConfirmEnable2FAResultCode.TOTPNotEnabled);
      if (!(usr?.Test2FACode(code))) return new ConfirmEnable2FAResult(false, ConfirmEnable2FAResultCode.TOTPIncorrect);

      await UserRepo.update({ UserID: UserID }, { totpenabled: true });
      return new ConfirmEnable2FAResult(true, ConfirmEnable2FAResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] AuthService::ConfirmEnable2FA\n${err}`);
      return new ConfirmEnable2FAResult(false, ConfirmEnable2FAResultCode.InternalError);
    }
  }
  export async function Disable2FA(token?: string, code?: string): Promise<Disable2FAResult> {
    try {
      if (token == undefined || code == undefined) return new Disable2FAResult(false, Disable2FAResultCode.NullParameter);

      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new Disable2FAResult(false, Disable2FAResultCode.NoAuth);

      const usr = await UserRepo.findOneBy({ UserID: UserID });
      if (usr?.totpkey == "" || !(usr?.totpenabled)) return new Disable2FAResult(false, Disable2FAResultCode.TOTPNotEnabled);
      if (!(usr?.Test2FACode(code))) return new Disable2FAResult(false, Disable2FAResultCode.TOTPIncorrect);

      await UserRepo.update({ UserID: UserID }, { totpenabled: false, totpkey: "" });
      return new Disable2FAResult(true, Disable2FAResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] AuthService::Disable2FA\n${err}`);
      return new Disable2FAResult(false, Disable2FAResultCode.InternalError);
    }
  }
  export async function ConfirmAuth2FA(hash?: string, ip?: string, code?: string): Promise<ConfirmAuth2FAResult> {
    try {
      if (hash == undefined || code == undefined || ip == undefined) return new ConfirmAuth2FAResult(false, ConfirmAuth2FAResultCode.NullParameter);

      const s = await SessionManager.GetSession(hash, ip);
      if (s.userid == undefined) return new ConfirmAuth2FAResult(false, ConfirmAuth2FAResultCode.NoAuth);

      const usr = await UserRepo.findOneBy({ UserID: s.userid });
      if (usr?.totpkey == "" || !(usr?.totpenabled)) return new ConfirmAuth2FAResult(false, ConfirmAuth2FAResultCode.TOTPNotEnabled);
      if (!(usr?.Test2FACode(code))) return new ConfirmAuth2FAResult(false, ConfirmAuth2FAResultCode.TOTPIncorrect);

      const Token = await TokenManager.GenerateToken(usr.UserID);
      return new ConfirmAuth2FAResult(true, ConfirmAuth2FAResultCode.Success, Token.hash);
    } catch (err) {
      console.log(`[ERROR] AuthService::ConfirmAuth2FA\n${err}`);
      return new ConfirmAuth2FAResult(false, ConfirmAuth2FAResultCode.InternalError);
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
  public status: AuthResultCode | StatusCodes;
  public token?: string;

  constructor (ok: boolean, status: AuthResultCode, token?: string) {
    this.ok = ok;
    this.status = status;
    this.token = token;
  }
}
export class RegistrationResult {
  public ok: boolean;
  public status: RegisterResultCode | StatusCodes;
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
export class Enable2FAResult {
  public ok: boolean;
  public status: number;
  public key?: string;

  constructor (ok: boolean, status: number, key?: string) {
    this.ok = ok;
    this.status = status;
    this.key = key;
  }
}
export class ConfirmEnable2FAResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}
export class ConfirmAuth2FAResult {
  public ok: boolean;
  public status: number;
  public token?: string;

  constructor (ok: boolean, status: number, token?: string) {
    this.ok = ok;
    this.status = status;
    this.token = token;
  }
}
export class Disable2FAResult {
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