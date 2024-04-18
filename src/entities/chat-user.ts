import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn()
  public id: number = 0;

  @Column()
  public chatid: number = 0;

  @Column()
  public userid: number = 0;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  public joindate: Date = new Date();
}