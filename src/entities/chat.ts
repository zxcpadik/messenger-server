import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";
import { MessagingService } from "../services/messaging-service";
import { ChatUserRepo, MessageRepo, UserRepo } from "../services/db-service";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    public chatid: number = 0;

    @Column({type: "text" })
    public title: string = "";

    @Column({type: "text", nullable: true })
    public description: string | undefined;

    @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    public creationdate: Date = new Date();

    @Column()
    public creatorid: number = 0;

    @Column()
    public isuser: boolean = false;

    @Column()
    public isgroup: boolean = false;

    public users: string[] = [];

    public async GetUsers() {
      let usersids = (await ChatUserRepo.findBy({ chatid: this.chatid })).map<number>((x) => x.userid);
      for (let id of usersids) this.users.push((await UserRepo.findOneBy({ UserID: id }))?.nickname || "");
    }

    public async IsUserAvailable(UserID: number) {
      return await ChatUserRepo.existsBy({ chatid: this.chatid, userid: UserID});
    }

    public async GetUsersAvailable() {
      return await ChatUserRepo.findBy({ chatid: this.chatid });
    }

    public async GetMessagesCount() {
      return await MessageRepo.countBy({ chatid: this.chatid });
    }
}