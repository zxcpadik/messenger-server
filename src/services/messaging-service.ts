import { And, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Chat } from "../entities/chat";
import { ChatUser } from "../entities/chat-user";
import { Message } from "../entities/message";
import { TokenManager } from "./auth-service";
import { ChatRepo, ChatUserRepo, MessageRepo, UserRepo } from "./db-service";


export module MessagingService {
  export async function GetChat(chatID: number) {
    return await ChatRepo.findOneBy({ ChatID: chatID });
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
    MessageRepo.save(msg);

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

    const msgs = await MessageRepo.find({where: { ChatID: chatID, LocalMessageID: And(MoreThanOrEqual(offset), LessThanOrEqual(offset + count))}, take: count});
    return {msg: msgs, code: 210};
  }

  export async function GetUserChats(token: string): Promise<{chats: Chat[], code: number}> {
    var UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return {chats: [], code: 211};

    var chatsIDs = await ChatUserRepo.findBy({ UserID: UserID });
    var chats: Chat[] = [];

    for (var chatusr of chatsIDs) {
      var c = await ChatRepo.findOneBy({ ChatID: chatusr.ChatID })
      if (c != null) chats.push(c);
    }

    return {chats: chats, code: 210};
  }

  export async function CreateChat(token: string, userIDs: number[], title: string): Promise<{chat: Chat | undefined, code: number}> {
    var UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return {chat: undefined, code: 221};

    if (title.length > 64) return {chat: undefined, code: 222};

    var UserExists = UserRepo.existsBy({ UserID: userIDs[0] });
    if (!UserExists) return {chat: undefined, code: 223};

    var chat = new Chat();
    chat.ChatID = await ChatRepo.count();
    chat.CreatorID = UserID;
    chat.Title = title;
    chat.IsGroup = true;
    
    ChatUserRepo.save({ ChatID: chat.ChatID, UserID: UserID });
    ChatUserRepo.save({ ChatID: chat.ChatID, UserID: userIDs[0] });

    ChatRepo.save(chat);

    return {chat, code: 220}
  }
}