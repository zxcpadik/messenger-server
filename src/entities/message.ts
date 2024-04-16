import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryColumn()
    public MessageID: number = 0;

    @Column({type: "text" })
    public Text: string = "";

    @Column({ type: "timestamp" })
    public SentDate: Date = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));

    @Column()
    public SenderID: number = 0;

    @Column()
    public ReplyID: number = -1;
}