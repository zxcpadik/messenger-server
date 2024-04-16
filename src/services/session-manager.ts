import { Session } from "../entities/session";
import { generate } from "randomstring"
import { AppDataSource } from "./db-service";


export module SessionManager {
    const SessionRepo = AppDataSource.getRepository(Session);

    export async function OpenNewSession(ip: string) {
        var s = new Session();
        s.IPAddress = ip;
        s.Hash = generate(32);
        return await SessionRepo.save(s);
    }

    export async function RenewSession(hash: string, ip: string) {
        var s = await SessionRepo.findOneBy({ Hash: hash, IPAddress: ip});
        if (s == null) {
            s = new Session();
            s.IPAddress = ip;
            s.Hash = generate(32);
            return await SessionRepo.save(s);;
        }
        s.Renew();
        return await SessionRepo.save(s);
    }
}