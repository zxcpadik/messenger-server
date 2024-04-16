import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";

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
}