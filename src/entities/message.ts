import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";
import { MessageFlag } from "../declarations/enums";
import { UserRepo } from "../services/db-service";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    public messageid: number = 0;

    @Column()
    public localmessageid: number = 0;

    @Column()
    public chatid: number = 0;

    @Column({ type: 'integer', default: 0})
    public flag: MessageFlag = 0;

    @Column({type: "text" })
    public text: string = "";

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    public sentdate: Date = new Date();

    @Column()
    public senderid: number = 0;

    public sender: string = "DELETED";

    @Column()
    public replyid: number = -1;
}