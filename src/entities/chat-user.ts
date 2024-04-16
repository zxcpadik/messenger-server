import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChatUser {
    @PrimaryColumn()
    public UserID: number = 0;

    @Column()
    public ChatID: number = 0;

    @Column({ type: "timestamp" })
    public JoinDate: Date = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
}