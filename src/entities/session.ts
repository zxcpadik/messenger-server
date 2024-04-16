import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Session {
    @PrimaryColumn({type: "nvarchar", length: 32 })
    public Hash: string = "";

    @Column({ type: "timestamp" })
    public DecayDate: Date = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + (120 * 60000));

    @Column({ type: "text" })
    public IPAddress: string = "";

    public IsDecayed() {
        return this.DecayDate.getTime() < (new Date().getTime() - new Date().getTimezoneOffset() * 60000);
    }

    public Renew() {
        this.DecayDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + (7200000));
    }
}