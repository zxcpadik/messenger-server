
// SYS imports
import express, { Express, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';

// API imports
import { SessionManager } from "../services/session-manager";
import { AuthCredentials, AuthService } from "../services/auth-service";
import { AuthResultCode } from "../declarations/enums";

// VAR constants
const URL_PATH = '/api/v1/';
const TOKEN_LIFETIME = 604800000 // 7 days | 7*24*60*60*1000

// TEMP PATCH BEFORE FULL REST
function patch_auth_status(x: AuthResultCode): StatusCodes { 
  return {
    100: StatusCodes.OK,
    101: StatusCodes.BAD_REQUEST,
    102: StatusCodes.BAD_REQUEST,
    103: StatusCodes.BAD_REQUEST,
    104: StatusCodes.NOT_FOUND,
    105: StatusCodes.UNAUTHORIZED,
    106: StatusCodes.FORBIDDEN,
    109: StatusCodes.INTERNAL_SERVER_ERROR,
    default: x
  }[x] || x;
}

// TODO patch cookie options + secure
function register(app: Express) {
  app.get(URL_PATH + 'session', async (req, res) => {
    const IP = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress;
    const Hash = req.cookies['session'];
    if (!IP) {
      return (res.status(StatusCodes.BAD_REQUEST).send(), void 0);
    }
    
    var s = await (!Hash ? SessionManager.OpenNewSession(IP) : SessionManager.RenewSession(Hash, IP));
    let ok = !s.IsDecayed();
    let rest = (ok ? StatusCodes.OK : StatusCodes.UNAUTHORIZED);

    if (ok) res.cookie('session', s.Hash);
    else { res.clearCookie('session'); s.Hash = undefined as unknown as string; }

    return (res.status(rest).json({ status: rest, hash: s.Hash }), void 0);
  }); // * [API] /SESSION

  app.post(URL_PATH + 'user/auth', async (req: Request, res: Response) => {
    const IP = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress;
    const Hash = req.cookies['session'];
    if (!IP) return (res.status(StatusCodes.BAD_REQUEST).send(), void 0);

    const Session = await SessionManager.GetSession(Hash, IP);
    if (Session.IsDecayed()) return (res.status(StatusCodes.UNAUTHORIZED).send(), void 0);

    const creds = [req.body["username"], req.body["password"]]
    if (creds.some(x => !x || x === "")) return (res.status(StatusCodes.BAD_REQUEST).send(), void 0);
  
    const apires = await AuthService.AuthUser(new AuthCredentials(...(creds.map(x => String(x)))), Hash, IP);
    apires.status = patch_auth_status(apires.status as AuthResultCode)

    if (apires.status === StatusCodes.OK) res.cookie('token', apires.token, { maxAge: TOKEN_LIFETIME, httpOnly: true });
    else res.clearCookie('token');

    return (res.status(apires.status).json(apires), void 0);
  }); // * [API] /USER/AUTH

}

export default register;