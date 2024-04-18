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

  public IsDecayed() {
    var decay = this.DecayDate.getTime() < Date.now();
    if (decay) SessionRepo.remove(this);
    return decay;
  }

  public Renew() {
    this.DecayDate = new Date(Date.now() + 7200000);
  }
}