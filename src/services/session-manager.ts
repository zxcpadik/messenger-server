import { Session } from "../entities/session";
import { generate } from "randomstring"
import { SessionRepo } from "./db-service";


export module SessionManager {
  
  setInterval(async () => {
    try {
      var sr = await SessionRepo.find();
      for (let si = 0; si < sr.length; si++) {
        if (sr[si].IsDecayed()) SessionRepo.remove(sr[si]);
      }
    } catch (err) {
      console.log(`[ERROR] SessionManager::Remover`);
    }
  }, 180000);

  export async function OpenNewSession(ip: string) {
    try {
      var s = new Session();
      s.IPAddress = ip;
      s.Hash = generate({ length: 32, charset: 'hex'});
      s.Renew();
      return await SessionRepo.save(s);
    } catch (err) {
      console.log(`[ERROR] SessionManager::OpenNewSession\n${err}`);
      return new Session();
    }
  }
  export async function RenewSession(hash: string, ip: string) {
    try {
      var s = await SessionRepo.findOneBy({ Hash: hash, IPAddress: ip });
      if (s == null) return new Session();
      if (!s.IsDecayed()) {
          s.Renew();
          return await SessionRepo.save(s);
      }
      return new Session(); 
    } catch (err) {
      console.log(`[ERROR] SessionManager::RenewSession\n${err}`);
      return new Session();
    }
  }
  export async function GetSession(hash: string, ip: string) {
    return (await SessionRepo.findOneBy({ Hash: hash, IPAddress: ip})) || new Session();
  }
  export async function AuthSession(hash: string, ip: string, userid: number) {
    return ((await SessionRepo.update({ Hash: hash, IPAddress: ip}, { userid: userid })).affected || 0) > 0;
  }
}