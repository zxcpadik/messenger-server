import { ChatUser } from "../entities/chat-user"
import { Session } from "../entities/session"
import { DataSource, Repository } from "typeorm"
import { Token } from "../entities/token"
import { User } from "../entities/user"
import { Message } from "../entities/message"
import { Chat } from "../entities/chat"
import { Meta } from "../entities/file-meta"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "yFpulGPi4L9Mnq3j",
    database: "messenger",
    entities: [Session, ChatUser, Token, User, Message, Chat, Meta],
    synchronize: true,
    logging: false,
    cache: true
});

AppDataSource.initialize()
    .then(() => {
        console.log("[DB] Initialized!")
        TokenRepo    = AppDataSource.getRepository(Token);
        UserRepo     = AppDataSource.getRepository(User);
        MessageRepo  = AppDataSource.getRepository(Message);
        ChatRepo     = AppDataSource.getRepository(Chat);
        ChatUserRepo = AppDataSource.getRepository(ChatUser);
        SessionRepo  = AppDataSource.getRepository(Session);
        MetaRepo     = AppDataSource.getRepository(Meta);
  
    })
    .catch((err) => {
        console.error("[DB][ERROR] Data Source initialization error!", err)
    });

export var TokenRepo: Repository<Token>;
export var UserRepo: Repository<User>;
export var MessageRepo: Repository<Message>;
export var ChatRepo: Repository<Chat>;
export var ChatUserRepo: Repository<ChatUser>;
export var SessionRepo: Repository<Session>;
export var MetaRepo: Repository<Meta>;