import { And, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Chat } from "../entities/chat";
import { ChatUser } from "../entities/chat-user";
import { Message } from "../entities/message";
import { TokenManager } from "./auth-service";
import { ChatRepo, ChatUserRepo, MessageRepo, UserRepo } from "./db-service";
import { ChatInfoResultCode, ClearChatResultCode, CreateChatResultCode, GetUserChatsResultCode, MessagePullResultCode, MessagePushResultCode, RemoveChatResultCode } from "../declarations/enums";


export module MessagingService {
  export function GetChat(chatID?: number) {
    return ChatRepo.findOneBy({ chatid: chatID || -1 });
  }
  export function GetUsersChat(chatID?: number) {
    return ChatUserRepo.findBy({ chatid: chatID || -1 });
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
  export async function CreateChat(token?: string, userIDs?: number[], title?: string, description?: string): Promise<CreateChatResult> {
    if (token == undefined || userIDs == undefined || title == undefined) return new CreateChatResult(false, CreateChatResultCode.NullParameter);

    var UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return new CreateChatResult(false, CreateChatResultCode.NoAuth);

    if (title.length > 64 || title.length == 0) return new CreateChatResult(false, CreateChatResultCode.TitleFormat);
    if (description != undefined && description.length > 128) return new CreateChatResult(false, CreateChatResultCode.DescriptionFormat);

    var chat = new Chat();
    chat.creatorid = UserID;
    chat.title = title;
    chat.isgroup = true;
    chat.description = description;
    chat = await ChatRepo.save(chat);
    
    ChatUserRepo.save({ chatid: chat.chatid, userid: UserID, joindate: new Date() });
    for (let uid of userIDs) {
      if (!(await UserRepo.existsBy({ UserID: uid }))) continue;
      await ChatUserRepo.save({ chatid: chat.chatid, userid: uid, joindate: new Date() });
    }

    await chat.GetUsers();
    return new CreateChatResult(true, CreateChatResultCode.Success, chat);
  }
  export async function ClearChat(token?: string, chatid?: number): Promise<ClearChatResult> {
    if (token == undefined || chatid == undefined) return new ClearChatResult(false, ClearChatResultCode.NullParameter) 
    
    const UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return new ClearChatResult(false, ClearChatResultCode.NoAuth);
  
    const Chat = await GetChat(chatid);
    if (Chat == null) return new ClearChatResult(false, ClearChatResultCode.ChatNotExist);
    if (!(await Chat.IsUserAvailable(UserID))) return new ClearChatResult(false, ClearChatResultCode.ChatNoAccess);

    const res = await MessageRepo.delete({
      chatid: chatid
    });
    
    return new ClearChatResult(true, ClearChatResultCode.Success, res.affected || 0);
  }
  export async function RemoveChat(token?: string, chatid?: number): Promise<RemoveChatResult> {
    if (token == undefined || chatid == undefined) return new RemoveChatResult(false, RemoveChatResultCode.NullParameter) 
    
    const UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return new RemoveChatResult(false, RemoveChatResultCode.NoAuth);
  
    const Chat = await GetChat(chatid);
    if (Chat == null) return new RemoveChatResult(false, RemoveChatResultCode.ChatNotExist);
    if (!(await Chat.IsUserAvailable(UserID))) return new RemoveChatResult(false, RemoveChatResultCode.ChatNoAccess);

    await MessageRepo.delete({
      chatid: chatid
    });

    await ChatUserRepo.delete({
      chatid: chatid
    });

    await ChatRepo.delete({
      chatid: chatid
    });
    
    return new RemoveChatResult(true, RemoveChatResultCode.Success);
  }
  export async function ChatInfo(token?: string, chatid?: number): Promise<ChatInfoResult> {
    if (token == undefined || chatid == undefined) return new ChatInfoResult(false, ChatInfoResultCode.NullParameter) 
    
    const UserID = await TokenManager.AuthToken(token);
    if (UserID == undefined) return new ChatInfoResult(false, ChatInfoResultCode.NoAuth);
  
    const Chat = await GetChat(chatid);
    if (Chat == null) return new ChatInfoResult(false, ChatInfoResultCode.ChatNotExist);
    if (!(await Chat.IsUserAvailable(UserID))) return new ChatInfoResult(false, ChatInfoResultCode.ChatNoAccess);

    await Chat.GetUsers();
    const res = await MessageRepo.countBy({
      chatid: chatid
    });

    var info = new ChatInfoObj();
    info.creationdate = Chat.creationdate;
    info.creatorid = Chat.creatorid;
    info.messages = res;
    info.title = Chat.title;
    info.users = Chat.users;
    info.description = Chat.description;
    
    return new ChatInfoResult(true, ChatInfoResultCode.Success, info);
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
export class ClearChatResult {
  public ok: boolean;
  public code: number;
  public affected?: number;

  constructor (ok: boolean, code: number, affected?: number) {
    this.ok = ok;
    this.code = code;
    this.affected = affected;
  }
}
export class RemoveChatResult {
  public ok: boolean;
  public code: number;

  constructor (ok: boolean, code: number) {
    this.ok = ok;
    this.code = code;
  }
}
export class ChatInfoResult {
  public ok: boolean;
  public code: number;
  public info?: ChatInfoObj;

  constructor (ok: boolean, code: number, info?: ChatInfoObj) {
    this.ok = ok;
    this.code = code;
    this.info = info;
  }
}
export class SetChatInfoResult {
  public ok: boolean;
  public code: number;

  constructor (ok: boolean, code: number) {
    this.ok = ok;
    this.code = code;
  }
}

export class ChatInfoObj {
  public title?: string;
  public description?: string;
  public users?: number[];
  public messages?: number;
  public creatorid?: number;
  public creationdate?: Date;
}
