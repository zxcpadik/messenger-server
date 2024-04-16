import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Token {
    @PrimaryColumn({ type: "text" })
    public hash: string = "";

    @Column()
    public UserID: number = 0;

    @Column({ type: "timestamp" })
    public DecayDate: Date = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + (2592000000));

    public IsDecayed() {
        return this.DecayDate.getTime() < (new Date().getTime() - new Date().getTimezoneOffset() * 60000);
    }

    public Renew() {
        this.DecayDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + (2592000000));
    }
}