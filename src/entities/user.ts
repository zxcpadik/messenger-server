import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";
import SHA256 from "sha256";
import { generate } from "randomstring";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public UserID: number = 0;

  @Column({type: "text" })
  public Username: string = "";

  @Column({type: "text" })
  public Password: string = "";

  @Column({ type: "timestamp" })
  public CreationDate: Date = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));

  @Column({ type: "text" })
  public IPAddress: string = "";

  public UpdatePassword(pass: string) {
    let salt1 = generate(16);
    let salt2 = generate(16);
    let hash = SHA256([salt1, pass, salt2].join());

    this.Password = [hash, salt1, salt2].join(":");
  }
  public ComparePassword(pass: string): boolean {
    if (!pass) return false;

    let blocks = this.Password.split(":");
    let hash = SHA256([blocks[1], pass, blocks[2]].join());
  
    return hash === blocks[0];
  }
}