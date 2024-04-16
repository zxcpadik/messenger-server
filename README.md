# messenger-server

## API
### Session
#### Session:Open
Opens new session
``` C#
[GET] /api/v0/session/open
    Return: Plain/Text { session?: string }
```

#### Session:Ping 
Keeps session marked online
``` C#
[GET] /api/v0/session/ping
    Header: session
    Return: Plain/Text: "pong" - status ok
                        "closed" - status closed
```
### User
#### User:Auth
User authorization
``` C#
[POST] /api/v0/user/auth
    Args: JSON { username: string, password: AES(password, key: session) }
    Header: session
    Return: JSON { ok: boolean, status: int, token?: string }
    Status: 100 - Auth OK
            101 - Password Incorrect
            102 - User not exist
            103 - Internal Error
```

#### User:Register
User registration
``` C#
[POST] /api/v0/user/register
    Args: JSON { username: string, password: AES(password, key: session) }
    Return: JSON { ok: boolean, status: int, token?: string }
    Status: 110 - Register OK
            111 - Bad Format
            112 - User already exist
            113 - Internal Error
```
### Messages
#### Client:Message:Pull
Pull messages from chat
``` C#
[POST] /api/v0/client/messages/pull
    Args: JSON { 
            chatid: bigint (ulong),
            options?: {
                offset: int (default: last)
                count: int (default: 1, maximum: 100)
            }
        }
    Header: token
    Return: JSON { ok: boolean, status: int, messages?: Message[] }
    Status: 200 - Message Pull OK
            201 - Auth invalid
            202 - ChatID does not exist
            203 - Internal Error
```

#### Client:Message:Push
Push messages into chat
``` C#
[POST] /api/v0/client/messages/push
    Args: JSON {
            chatid: bigint (ulong),
            text: string (max: 512 chars)
            options?: {/* RESERVED IN DEV*/}
        }
    Header: token
    Return: JSON { ok: boolean, status: int, messages?: Message[] }
    Status: 200 - Message Push OK
            201 - Auth invalid
            202 - ChatID does not exist
            203 - Text too long
            204 - Internal Error
```
### Chats
#### Client:Chat:Get
Get all chats
``` C#
[POST] /api/v0/client/chat/get
    Args: JSON {
            options?: {/* RESERVED IN DEV*/}
        }
    Header: token
    Return: JSON { ok: boolean, status: int, chats?: Chat[] }
    Status: 200 - Chats Get OK
            201 - Auth invalid
            202 - Internal Error
```

#### Client:Chat:Create
Create new chat
``` C#
[POST] /api/v0/client/chat/create
    Args: JSON {
            userid: int[] - ID of users /*GROUPS IN DEV SUPPORT ONLY 1 USERID*/
            title: string - /*RESERVED IN DEV FOR GROUPS*/
        }
    Header: token
    Return: JSON { ok: boolean, status: int, chat?: Chat }
    Status: 200 - Chats Create OK
            201 - Auth invalid
            202 - Title too long
            203 - Internal Error
```

## Objects

#### Message
``` C#
Message {
    text: string
    from: int - Sender UserID    
    time: bigint (ulong) - Message send time as UNIX without Time Zone
    replyid?: int - Reply UserID /*RESERVED IN DEV*/
}
```

#### Chat
``` C#
Chat {
    title: string
    chatid: int
    users: int[]
    isUser: boolean /*RESERVED IN DEV*/
    isGroup: boolean /*RESERVED IN DEV*/
}
```

## Variables
>Token - save in cookie, long decay (1mo)

>Session - save in cookie, fast decay (2h)