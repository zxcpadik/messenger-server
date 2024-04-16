import { ChatUser } from "../entities/chat-user"
import { Session } from "../entities/session"
import { DataSource } from "typeorm"
import { Token } from "../entities/token"
import { User } from "../entities/user"
import { Message } from "../entities/message"
import { Chat } from "../entities/chat"

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "yFpulGPi4L9Mnq3j",
    database: "messenger",
    entities: [Session, ChatUser, Token, User, Message, Chat],
    subscribers: [],
    migrations: [],
    synchronize: true,
    logging: false
})

export const DBSource = AppDataSource;

AppDataSource.initialize()
    .then(() => {
        console.log("[DB] Initialized!")
    })
    .catch((err) => {
        console.error("[DB][ERROR] Data Source initialization error!", err)
    })