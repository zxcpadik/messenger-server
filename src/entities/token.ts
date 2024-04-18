import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Token {
    @PrimaryColumn({ type: "text" })
    public hash: string = "";

    @Column()
    public UserID: number = 0;

    @Column({ type: "timestamptz", default: () => 'epoch' })
    public DecayDate: Date = new Date(0);

    public IsDecayed() {
        return this.DecayDate.getTime() < Date.now();
    }

    public Renew() {
        this.DecayDate = new Date(Date.now() + 2592000000);
    }
}