import { Session } from "../entities/session";
import { generate } from "randomstring"
import { SessionRepo } from "./db-service";


export module SessionManager {
    export async function OpenNewSession(ip: string) {
        var s = new Session();
        s.IPAddress = ip;
        s.Hash = generate(32);
        s.Renew();
        return await SessionRepo.save(s);
    }

    export async function RenewSession(hash: string, ip: string) {
        var s = await SessionRepo.findOneBy({ Hash: hash, IPAddress: ip});
        if (s == null) return new Session();
        if (!s.IsDecayed()) {
            s.Renew();
            return await SessionRepo.save(s);
        }
        return new Session(); 
    }

    export async function GetSession(hash: string, ip: string) {
        return (await SessionRepo.findOneBy({ Hash: hash, IPAddress: ip})) || new Session();
    }
}