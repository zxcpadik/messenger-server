import { Entity, PrimaryColumn, Column } from "typeorm";
import { SessionRepo } from "../services/db-service";

@Entity()
export class Session {
  @PrimaryColumn({ length: 64 })
  public Hash: string = "";

  @Column({ type: "timestamptz", default: 'epoch' })
  public DecayDate: Date = new Date(0);

  @Column()
  public IPAddress: string = "";

  @Column({ nullable: true })
  public userid: number = -1;

  public IsDecayed() {
    return this.DecayDate < new Date();
  }

  public Renew() {
    this.DecayDate = new Date(Date.now() + 90000);
  }
}