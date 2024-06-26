import { And, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Chat } from "../entities/chat";
import { ChatUser } from "../entities/chat-user";
import { Message } from "../entities/message";
import { TokenManager } from "./auth-service";
import { ChatRepo, ChatUserRepo, MessageRepo, UserRepo } from "./db-service";
import { AddUserResultCode, ChatInfoResultCode, ClearChatResultCode, CreateChatResultCode, EditMessageResultCode, GetUserChatsResultCode, MessageFlag, MessagePullResultCode, MessagePushResultCode, RemoveChatResultCode, RemoveMessageResultCode, RemoveUserResultCode, SetChatInfoResultCode } from "../declarations/enums";
import clamp from "clamp";

export module MessagingService {
  export function GetChat(chatID?: number) {
    return ChatRepo.findOneBy({ chatid: chatID || -1 });
  }
  export function GetUsersChat(chatID?: number) {
    return ChatUserRepo.findBy({ chatid: chatID || -1 });
  }

  export async function PushMessage(token?: string, text?: string, chatID?: number): Promise<MessagePushResult> {
    try {
      if (token == undefined || text == undefined || chatID == undefined) return new MessagePushResult(false, MessagePushResultCode.NullParameter);

      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new MessagePushResult(false, MessagePushResultCode.NoAuth);

      const Chat = await GetChat(chatID);
      if (Chat == null) return new MessagePushResult(false, MessagePushResultCode.ChatNotExist);
      if (!(await Chat.IsUserAvailable(UserID))) return new MessagePushResult(false, MessagePushResultCode.ChatNoAccess);
      if (text.length > 512 || text.length == 0) return new MessagePushResult(false, MessagePushResultCode.TextLenght);

      const msgid = await Chat.GetMessagesCount();
      const msg = new Message();
      msg.chatid = chatID;
      msg.text = text;
      msg.senderid = UserID;
      msg.localmessageid = msgid;
      MessageRepo.save(msg);

      return new MessagePushResult(true, MessagePushResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] MessagingService::PushMessage\n${err}`);
      return new MessagePushResult(false, MessagePushResultCode.InternalError);
    }
  }
  export async function PullMessage(token?: string, chatID?: number, offset?: number, count: number = 1): Promise<MessagePullResult> {
    try {
      if (token == undefined || chatID == undefined) return new MessagePullResult(false, MessagePullResultCode.NullParameter);
      count = clamp(count, 0, 100);
      
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
      for (let x of msgs) {
        x.sender = (await UserRepo.findOneBy({ UserID: x.senderid }))?.nickname || "DELETED";
        x.messageid = 0;
        x.senderid = 0;
      }
      return new MessagePullResult(true, MessagePullResultCode.Success, msgs);
    } catch (err) {
      console.log(`[ERROR] MessagingService::PullMessage\n${err}`);
      return new MessagePullResult(false, MessagePullResultCode.InternalError);
    }
  }
  export async function RemoveMesasge(token?: string, chatid?: number, messageid?: number): Promise<RemoveMessageResult> {
    try {
      if (token == undefined || chatid == undefined || messageid == undefined) return new RemoveMessageResult(false, RemoveMessageResultCode.NullParameter) 
    
      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new RemoveMessageResult(false, RemoveMessageResultCode.NoAuth);
    
      const Chat = await GetChat(chatid);
      if (Chat == null) return new RemoveMessageResult(false, RemoveMessageResultCode.ChatNotExist);
      if (!(await Chat.IsUserAvailable(UserID))) return new RemoveMessageResult(false, RemoveMessageResultCode.ChatNoAccess);
    
      if (!(await MessageRepo.existsBy({ chatid: chatid, localmessageid: messageid }))) return new RemoveMessageResult(false, RemoveMessageResultCode.MessageNotFound);
    
      MessageRepo.delete({ chatid: chatid, localmessageid: messageid });
    
      return new RemoveMessageResult(true, RemoveMessageResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] MessagingService::RemoveMesasge\n${err}`);
      return new RemoveMessageResult(false, RemoveMessageResultCode.InternalError);
    }
  }
  export async function EditMesasge(token?: string, chatid?: number, messageid?: number, text?: string): Promise<EditMessageResult> {
    try {
      if (token == undefined || chatid == undefined || messageid == undefined || text == undefined) return new EditMessageResult(false, EditMessageResultCode.NullParameter) 
    
      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new EditMessageResult(false, EditMessageResultCode.NoAuth);
    
      const Chat = await GetChat(chatid);
      if (Chat == null) return new EditMessageResult(false, EditMessageResultCode.ChatNotExist);
      if (!(await Chat.IsUserAvailable(UserID))) return new EditMessageResult(false, EditMessageResultCode.ChatNoAccess);
    
      if (!(await MessageRepo.existsBy({ chatid: chatid, localmessageid: messageid }))) return new EditMessageResult(false, EditMessageResultCode.MessageNotFound);
      if (text.length > 512 || text.length == 0) return new MessagePushResult(false, MessagePushResultCode.TextLenght);
    
      MessageRepo.update({ chatid: chatid, localmessageid: messageid }, { text: text, flag: MessageFlag.Edited });
    
      return new EditMessageResult(true, EditMessageResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] MessagingService::EditMesasge\n${err}`);
      return new EditMessageResult(false, EditMessageResultCode.InternalError);
    }
  } 


  export async function GetUserChats(token?: string): Promise<GetUserChatsResult> {
    try {
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
    } catch (err) {
      console.log(`[ERROR] MessagingService::GetUserChats\n${err}`);
      return new GetUserChatsResult(false, GetUserChatsResultCode.InternalError);
    }
  }
  export async function CreateChat(token?: string, nicknames?: string[], title?: string, description?: string): Promise<CreateChatResult> {
    try {
      if (token == undefined || nicknames == undefined || title == undefined) return new CreateChatResult(false, CreateChatResultCode.NullParameter);

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
  
      let ids: number[] = [];
      for (let nick of nicknames) {
        ids.push((await UserRepo.findOneBy({ nickname: nick }))?.UserID || -1);
      }
  
      let userIDs = [...new Set(ids)];
      if (!userIDs.includes(UserID)) userIDs.push(UserID);
      for (let uid of userIDs) {
        if (!(await UserRepo.existsBy({ UserID: uid }))) continue;
        if (await ChatUserRepo.existsBy({ userid: uid, chatid: chat.chatid })) continue;
        await ChatUserRepo.save({ chatid: chat.chatid, userid: uid });
      }
  
      await chat.GetUsers();
      return new CreateChatResult(true, CreateChatResultCode.Success, chat);
    } catch (err) {
      console.log(`[ERROR] MessagingService::CreateChat\n${err}`);
      return new CreateChatResult(false, CreateChatResultCode.InternalError);
    }
  }
  export async function ClearChat(token?: string, chatid?: number): Promise<ClearChatResult> {
    try {
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
    } catch (err) {
      console.log(`[ERROR] MessagingService::ClearChat\n${err}`);
      return new CreateChatResult(false, CreateChatResultCode.InternalError);
    }
  }
  export async function RemoveChat(token?: string, chatid?: number): Promise<RemoveChatResult> {
    try {
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
    } catch (err) {
      console.log(`[ERROR] MessagingService::RemoveChat\n${err}`);
      return new RemoveChatResult(false, RemoveChatResultCode.InternalError);
    }
  }
  export async function ChatInfo(token?: string, chatid?: number): Promise<ChatInfoResult> {
    try {
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
    } catch (err) {
      console.log(`[ERROR] MessagingService::ChatInfo\n${err}`);
      return new ChatInfoResult(false, ChatInfoResultCode.InternalError);
    }
  }
  export async function SetChatInfo(token?: string, chatid?: number, title?: string, description?: string): Promise<SetChatInfoResult> {
    try {
      if (token == undefined || chatid == undefined || (title == undefined && description == undefined)) return new SetChatInfoResult(false, SetChatInfoResultCode.NullParameter) 
    
      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new SetChatInfoResult(false, SetChatInfoResultCode.NoAuth);
    
      const Chat = await GetChat(chatid);
      if (Chat == null) return new SetChatInfoResult(false, SetChatInfoResultCode.ChatNotExist);
      if (!(await Chat.IsUserAvailable(UserID))) return new SetChatInfoResult(false, SetChatInfoResultCode.ChatNoAccess);
    
      if (title != undefined && (title.length > 64 || title.length == 0)) return new CreateChatResult(false, SetChatInfoResultCode.TitleFormat);
      if (description != undefined && description.length > 128) return new CreateChatResult(false, SetChatInfoResultCode.DescriptionFormat);
    
      Chat.title = title || Chat.title;
      Chat.description = description || Chat.description;
      await ChatRepo.save(Chat);
      
      return new SetChatInfoResult(true, SetChatInfoResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] MessagingService::SetChatInfo\n${err}`);
      return new SetChatInfoResult(false, SetChatInfoResultCode.InternalError);
    }
  }
  export async function AddUser(token?: string, chatid?: number, user?: string): Promise<AddUserResult> {
    try {
      if (token == undefined || chatid == undefined || user == undefined) return new AddUserResult(false, AddUserResultCode.NullParameter) 
    
      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new AddUserResult(false, AddUserResultCode.NoAuth);
    
      const Chat = await GetChat(chatid);
      if (Chat == null) return new AddUserResult(false, AddUserResultCode.ChatNotExist);
      if (!(await Chat.IsUserAvailable(UserID))) return new AddUserResult(false, AddUserResultCode.ChatNoAccess);
    
      const aUser = await UserRepo.findOneBy({ nickname: user });
      if (aUser == null) return new AddUserResult(false, AddUserResultCode.UserNotFound);
      if (await ChatUserRepo.existsBy({ chatid: chatid, userid: aUser.UserID })) return new AddUserResult(false, AddUserResultCode.AlradyInGroup);
    
      await ChatUserRepo.save({ chatid: chatid, userid: aUser.UserID });
      
      return new AddUserResult(true, AddUserResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] MessagingService::AddUser\n${err}`);
      return new AddUserResult(false, AddUserResultCode.InternalError);
    }
  }
  export async function RemoveUser(token?: string, chatid?: number, user?: string): Promise<RemoveUserResult> {
    try {
      if (token == undefined || chatid == undefined || user == undefined) return new RemoveUserResult(false, RemoveUserResultCode.NullParameter) 
    
      const UserID = await TokenManager.AuthToken(token);
      if (UserID == undefined) return new RemoveUserResult(false, RemoveUserResultCode.NoAuth);
    
      const Chat = await GetChat(chatid);
      if (Chat == null) return new RemoveUserResult(false, RemoveUserResultCode.ChatNotExist);
      if (!(await Chat.IsUserAvailable(UserID))) return new RemoveUserResult(false, RemoveUserResultCode.ChatNoAccess);
    
      const aUser = await UserRepo.findOneBy({ nickname: user });
      if (aUser == null) return new RemoveUserResult(false, RemoveUserResultCode.UserNotFound);
      if (!(await ChatUserRepo.existsBy({ chatid: chatid, userid: aUser.UserID }))) return new RemoveUserResult(false, RemoveUserResultCode.UserNotInGroup);
    
      await ChatUserRepo.delete({ chatid: chatid, userid: aUser.UserID });
      
      return new RemoveUserResult(true, RemoveUserResultCode.Success);
    } catch (err) {
      console.log(`[ERROR] MessagingService::RemoveUser\n${err}`);
      return new RemoveUserResult(false, RemoveUserResultCode.InternalError);
    }
  }
}

export class MessagePushResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}
export class MessagePullResult {
  public ok: boolean;
  public status: number;
  public messages?: Message[];

  constructor (ok: boolean, status: number, messages?: Message[]) {
    this.ok = ok;
    this.status = status;
    this.messages = messages;
  }
}
export class RemoveMessageResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}
export class EditMessageResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}

export class CreateChatResult {
  public ok: boolean;
  public status: number;
  public chat?: Chat;

  constructor (ok: boolean, status: number, chat?: Chat) {
    this.ok = ok;
    this.status = status;
    this.chat = chat;
  }
}
export class GetUserChatsResult {
  public ok: boolean;
  public status: number;
  public chats?: Chat[];

  constructor (ok: boolean, status: number, chats?: Chat[]) {
    this.ok = ok;
    this.status = status;
    this.chats = chats;
  }
}
export class ClearChatResult {
  public ok: boolean;
  public status: number;
  public affected?: number;

  constructor (ok: boolean, status: number, affected?: number) {
    this.ok = ok;
    this.status = status;
    this.affected = affected;
  }
}
export class RemoveChatResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}
export class ChatInfoResult {
  public ok: boolean;
  public status: number;
  public info?: ChatInfoObj;

  constructor (ok: boolean, status: number, info?: ChatInfoObj) {
    this.ok = ok;
    this.status = status;
    this.info = info;
  }
}
export class SetChatInfoResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}
export class AddUserResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}
export class RemoveUserResult {
  public ok: boolean;
  public status: number;

  constructor (ok: boolean, status: number) {
    this.ok = ok;
    this.status = status;
  }
}

export class ChatInfoObj {
  public title?: string;
  public description?: string;
  public users?: string[];
  public messages?: number;
  public creatorid?: number;
  public creationdate?: Date;
}