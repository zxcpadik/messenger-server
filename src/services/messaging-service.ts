import { And, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Chat } from "../entities/chat";
import { ChatUser } from "../entities/chat-user";
import { Message } from "../entities/message";
import { TokenManager } from "./auth-service";
import { DBSource } from "./db-service";


export module MessagingService {
  export const MessagesRepo = DBSource.getRepository(Message);
  export const ChatsRepo = DBSource.getRepository(Chat);
  export const ChatsUserRepo = DBSource.getRepository(ChatUser);

  export async function GetChat(chatID: number) {
    return await ChatsRepo.findOneBy({ ChatID: chatID });
  }

  export async function PushMessage(token: string, text: string, chatID: number): Promise<number> {
    const UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return 201;
    if (text.length > 512) return 203;

    const Chat = await GetChat(chatID);
    if (Chat == null) return 202;
    if (!(await Chat.IsUserAvailable(UserID))) return 204;

    const msgid = await Chat.GetMessagesCount();
    const msg = new Message();
    msg.ChatID = chatID;
    msg.Text = text;
    msg.SenderID = UserID;
    msg.LocalMessageID = msgid;
    MessagesRepo.save(msg);

    return 200;
  }

  export async function PullMessage(token: string, chatID: number, offset?: number, count: number = 1): Promise<{msg: Message[], code: number}> {
    const UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return {msg: [], code: 211};

    const Chat = await GetChat(chatID);
    if (Chat == null) return {msg: [], code: 212};
    if (!(await Chat.IsUserAvailable(UserID))) return {msg: [], code: 213};

    const msgcount = await Chat.GetMessagesCount();
    if (offset == undefined) {
      offset = msgcount - 1;
    }

    const msgs = await MessagesRepo.find({where: { ChatID: chatID, LocalMessageID: And(MoreThanOrEqual(offset), LessThanOrEqual(offset + count))}, take: count});
    return {msg: msgs, code: 210};
  }
}