# messenger-server

## API
### Session
#### Session:Open
Open new session
```
[GET] /api/v0/session/open
    Return: Plain/Text { session?: string }
```
#### Session:Ping 
Keep session online
```
[GET] /api/v0/session/pulse
    Header: session
    Return: Plain/Text: "1" - status ok
                        "0" - status bad
```
### User
#### User:Auth
User authorization
```
[POST] /api/v0/user/auth
    Args: JSON { username: string, password: string }
    Header: session
    Return: JSON { ok: boolean, status: int, token?: string }
    Status: 100 - Success
            101 - NullParameter
            102 - UsernameFormat
            103 - PasswordFormat
            104 - UserNotExists
            105 - PasswordIncorrect
            109 - InternalError
```
#### User:Register
User registration
```
[POST] /api/v0/user/register
    Args: JSON { username: string, password: string }
    Return: JSON { ok: boolean, status: int, token?: string }
    Status: 101 - Success
            102 - NullParameter
            103 - UsernameFormat
            104 - PasswordFormat
            105 - UserAlreadyExists
            109 - InternalError
```
### Messages
#### Client:Message:Pull
Pull messages from chat
```
[POST] /api/v0/client/messages/pull
    Args: JSON { 
            chatid: bigint (ulong),
            options?: {
              offset: int (default: last)
              count: int (default: 1, maximum: 100)
            }
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int, messages?: Message[] }
    Status: 210 - Message Pull OK
            211 - Auth invalid
            212 - ChatID does not exist
            213 - Not in chat
            214 - Internal Error
```
#### Client:Message:Push
Push messages into chat
```
[POST] /api/v0/client/messages/push
    Args: JSON {
            chatid: bigint (ulong),
            text: string (max: 512 chars)
            options?: {/* RESERVED IN DEV*/}
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int }
    Status: 200 - Message Push OK
            201 - Auth invalid
            202 - ChatID does not exist
            203 - Text too long
            204 - Not in chat
            205 - Internal Error
```
### Chats
#### Client:Chat:Get
Get all chats
```
[POST] /api/v0/client/chat/get
    Args: JSON {
            options?: {/* RESERVED IN DEV*/}
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int, chats?: Chat[] }
    Status: 220 - Chats Get OK
            221 - Auth invalid
            222 - Internal Error
```
#### Client:Chat:Create
Create new chat
```
[POST] /api/v0/client/chat/create
    Args: JSON {
            userid: int[] - ID of users
            title: string
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int, chat?: Chat }
    Status: 230 - Chats Create OK
            231 - Auth invalid
            232 - Title too long
            233 - User not exist
            234 - Internal Error
```

## Objects

#### Message
```
Message {
  messageid: int - Global ID of message
  localmessageid: int - Local ID of message
  chatid: int - ID of chat
  text: string
  senderid: int - Sender UserID    
  sentdate: date (UNIX) - Message send time as UNIX
  replyid: int - Reply UserID /*RESERVED IN DEV*/
}
```

#### Chat
```
Chat {
  title: string
  chatid: int
  creatorid: int
  creationdate: date (UNIX)
  users: int[]
  isuser: boolean /*RESERVED IN DEV*/
  isgroup: boolean
}
```

## Variables
>Token - save in cookie, long decay (1mo) 64 chars

>Session - save in cookie, fast decay (2h), 32 chars