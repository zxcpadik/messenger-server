import { ChatUser } from "../entities/chat-user"
import { Session } from "../entities/session"
import { DataSource } from "typeorm"
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
    entities: [Session, ChatUser, Token, User, Message, Chat]
})

AppDataSource.initialize()
    .then(() => {
        console.log("[DB] Initialized!")
    })
    .catch((err) => {
        console.error("[DB][ERROR] Data Source initialization error!", err)
    })