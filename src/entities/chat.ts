import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";
import { MessagingService } from "../services/messaging-service";
import { ChatUserRepo, MessageRepo } from "../services/db-service";

@Entity()
export class Chat {
    @PrimaryColumn()
    public ChatID: number = 0;

    @Column({type: "text" })
    public Title: string = "";

    @Column({ type: "timestamp" })
    public CreationDate: Date = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));

    @Column()
    public CreatorID: number = 0;

    @Column()
    public IsUser: boolean = false;
    
    @Column()
    public IsGroup: boolean = false;

    public async IsUserAvailable(UserID: number) {
      return await ChatUserRepo.existsBy({ ChatID: this.ChatID, UserID});
    }

    public async GetUsersAvailable() {
      return await ChatUserRepo.findBy({ ChatID: this.ChatID });
    }

    public async GetMessagesCount() {
      return await MessageRepo.countBy({ ChatID: this.ChatID });
    }
}