import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { MessagingService } from "../services/messaging-service";
import { ChatUserRepo, MessageRepo, UserRepo } from "../services/db-service";
import { User } from "./user";

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

    @Column({ nullable: true })
    public lastmessageid: number = 0;

    @Column()
    public isuser: boolean = false;

    @Column()
    public isgroup: boolean = false;

    //@OneToMany((type) => User, (usr) => usr.nickname, { eager: true })
    public users: string[]  = [];//| undefined;

    public async GetUsers() {
      //return;
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