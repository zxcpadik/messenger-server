import { ChatUser } from "../entities/chat-user"
import { Session } from "../entities/session"
import { DataSource, Repository } from "typeorm"
import { Token } from "../entities/token"
import { User } from "../entities/user"
import { Message } from "../entities/message"
import { Chat } from "../entities/chat"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12345678",
    database: "messenger",
    entities: [Session, ChatUser, Token, User, Message, Chat],
    synchronize: true,
    logging: false
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