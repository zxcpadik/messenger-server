import { generate } from "randomstring";
import { Token } from "../entities/token";
import { User } from "../entities/user";
import { TokenRepo, UserRepo } from "./db-service";


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
    if (credentials.password == undefined || credentials.password.length < 8 || credentials.password.length > 128) return new AuthResult(false, 111);
    if (credentials.username == undefined || credentials.username.length < 6 || credentials.username.length > 64) return new AuthResult(false, 111);

    const usr = await UserRepo.findOneBy({ Username: credentials.username });
    if (usr == null) return new AuthResult(false, 102);

    const passValid = usr.ComparePassword(credentials.password);
    if (!passValid) return new AuthResult(false, 101);

    const Token = await TokenManager.GenerateToken(usr.UserID);
    return new AuthResult(true, 100, Token.hash);
  }

  export async function RegisterUser(credentials: AuthCredentials, IP: string): Promise<AuthResult> {
    const exist = await UserRepo.existsBy({ Username: credentials.username });
    if (exist) return new AuthResult(false, 112);

    if (credentials.password == undefined || credentials.password.length < 8 || credentials.password.length > 128) return new AuthResult(false, 111);
    if (credentials.username == undefined || credentials.username.length < 6 || credentials.username.length > 64) return new AuthResult(false, 111);

    const usr = new User();
    usr.IPAddress = IP;
    usr.UpdatePassword(credentials.password);
    usr.Username = credentials.username;
    const res = await UserRepo.save(usr);

    const Token = await TokenManager.GenerateToken(res.UserID);
    return new AuthResult(true, 110, Token.hash);
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
  public code: number;
  public token?: string;

  constructor (ok: boolean, code: number, token?: string) {
    this.ok = ok;
    this.code = code;
    this.token = token;
  }
}
export class RegistrationResult {
  public ok: boolean;
  public code: number;
  public token?: string;

  constructor (ok: boolean, code: number, token?: string) {
    this.ok = ok;
    this.code = code;
    this.token = token;
  }
}