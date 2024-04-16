import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Session {
  @PrimaryColumn({ length: 64 })
  public Hash: string = "";

  @Column({ type: "timestamptz" })
  public DecayDate: Date = new Date(0);

  @Column()
  public IPAddress: string = "";

  public IsDecayed() {
    return this.DecayDate.getTime() < (new Date().getTime() - new Date().getTimezoneOffset() * 60000);
  }

  public Renew() {
    this.DecayDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + (7200000));
  }
}