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
<<<<<<< Updated upstream
    return this.DecayDate.getTime() < Date.now();
=======
    return this.DecayDate < new Date();
>>>>>>> Stashed changes
  }

  public Renew() {
    this.DecayDate = new Date(Date.now() + 90000);
  }
}