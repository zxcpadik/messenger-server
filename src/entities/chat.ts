import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";
import { MessagingService } from "../services/messaging-service";

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

    public async IsUserAvailable(UserID: number) {
      return await MessagingService.ChatsUserRepo.existsBy({ ChatID: this.ChatID, UserID});
    }

    public async GetUsersAvailable() {
      return await MessagingService.ChatsUserRepo.findBy({ ChatID: this.ChatID });
    }

    public async GetMessagesCount() {
      return await MessagingService.MessagesRepo.countBy({ ChatID: this.ChatID });
    }
}