import { And, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Chat } from "../entities/chat";
import { ChatUser } from "../entities/chat-user";
import { Message } from "../entities/message";
import { TokenManager } from "./auth-service";
import { ChatRepo, ChatUserRepo, MessageRepo, UserRepo } from "./db-service";
import { CreateChatResultCode, GetUserChatsResultCode, MessagePullResultCode, MessagePushResultCode } from "../declarations/enums";


export module MessagingService {
  export async function GetChat(chatID?: number) {
    return await ChatRepo.findOneBy({ chatid: chatID || -1 });
  }

  export async function GetUsersChat(chatID?: number) {
    return await ChatUserRepo.findBy({ chatid: chatID || -1 });
  }

  export async function PushMessage(token?: string, text?: string, chatID?: number): Promise<MessagePushResult> {
    if (token == undefined || text == undefined || chatID == undefined) return new MessagePushResult(false, MessagePushResultCode.NullParameter);

    const UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return new MessagePushResult(false, MessagePushResultCode.NoAuth);
    if (text.length > 512 || text.length == 0) return new MessagePushResult(false, MessagePushResultCode.TextLenght);

    const Chat = await GetChat(chatID);
    if (Chat == null) return new MessagePushResult(false, MessagePushResultCode.ChatNotExist);
    if (!(await Chat.IsUserAvailable(UserID))) return new MessagePushResult(false, MessagePushResultCode.ChatNoAccess);

    const msgid = await Chat.GetMessagesCount();
    const msg = new Message();
    msg.chatid = chatID;
    msg.text = text;
    msg.senderid = UserID;
    msg.localmessageid = msgid;
    MessageRepo.save(msg);

    return new MessagePushResult(true, MessagePushResultCode.Success);
  }
  export async function PullMessage(token?: string, chatID?: number, offset?: number, count: number = 1): Promise<MessagePullResult> {
    if (token == undefined || chatID == undefined) return new MessagePullResult(false, MessagePullResultCode.NullParameter) 
    
    const UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return new MessagePullResult(false, MessagePullResultCode.NoAuth);

    const Chat = await GetChat(chatID);
    if (Chat == null) return new MessagePullResult(false, MessagePullResultCode.ChatNotExist);
    if (!(await Chat.IsUserAvailable(UserID))) return new MessagePullResult(false, MessagePullResultCode.ChatNoAccess);

    const msgcount = await Chat.GetMessagesCount();
    if (offset == undefined) {
      offset = msgcount - count;
    }

    const msgs = await MessageRepo.find({where: { chatid: chatID, localmessageid: And(MoreThanOrEqual(offset), LessThanOrEqual(offset + count))}, take: count});
    return new MessagePullResult(true, MessagePullResultCode.Success, msgs);
  }

  export async function GetUserChats(token?: string): Promise<GetUserChatsResult> {
    if (token == undefined) return new GetUserChatsResult(false, GetUserChatsResultCode.NullParameter);

    var UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return new GetUserChatsResult(false, GetUserChatsResultCode.NoAuth);

    var chatsIDs = await ChatUserRepo.findBy({ userid: UserID });
    var chats: Chat[] = [];

    for (var chatusr of chatsIDs) {
      var c = await ChatRepo.findOneBy({ chatid: chatusr.chatid })
      await c?.GetUsers();
      if (c != null) chats.push(c);
    }

    return new GetUserChatsResult(true, GetUserChatsResultCode.Success, chats);
  }
  export async function CreateChat(token?: string, userIDs?: number[], title?: string): Promise<CreateChatResult> {
    if (token == undefined || userIDs == undefined || title == undefined) return new CreateChatResult(false, CreateChatResultCode.NullParameter);

    var UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return new CreateChatResult(false, CreateChatResultCode.NoAuth);

    if (title.length > 64 || title.length == 0) return new CreateChatResult(false, CreateChatResultCode.TitleFormat);

    var chat = new Chat();
    chat.creatorid = UserID;
    chat.title = title;
    chat.isgroup = true;
    chat = await ChatRepo.save(chat);
    
    ChatUserRepo.save({ chatid: chat.chatid, userid: UserID, joindate: new Date() });
    for (let uid of userIDs) {
      if (!(await UserRepo.existsBy({ UserID: uid }))) continue;
      await ChatUserRepo.save({ chatid: chat.chatid, userid: uid, joindate: new Date() });
    }

    await chat.GetUsers();
    return new CreateChatResult(true, CreateChatResultCode.Success, chat);
  }
}

export class MessagePushResult {
  public ok: boolean;
  public code: number;

  constructor (ok: boolean, code: number) {
    this.ok = ok;
    this.code = code;
  }
}
export class MessagePullResult {
  public ok: boolean;
  public code: number;
  public messages?: Message[];

  constructor (ok: boolean, code: number, messages?: Message[]) {
    this.ok = ok;
    this.code = code;
    this.messages = messages;
  }
}

export class CreateChatResult {
  public ok: boolean;
  public code: number;
  public chat?: Chat;

  constructor (ok: boolean, code: number, chat?: Chat) {
    this.ok = ok;
    this.code = code;
    this.chat = chat;
  }
}
export class GetUserChatsResult {
  public ok: boolean;
  public code: number;
  public chats?: Chat[];

  constructor (ok: boolean, code: number, chats?: Chat[]) {
    this.ok = ok;
    this.code = code;
    this.chats = chats;
  }
}
