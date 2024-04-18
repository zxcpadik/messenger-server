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
    Status: 110 - Success
            111 - NullParameter
            112 - UsernameFormat
            113 - PasswordFormat
            114 - UserAlreadyExists
            119 - InternalError
```
### Messages
#### Client:Message:Push
Push messages into chat
```
[POST] /api/v0/client/messages/push
    Args: JSON {
            chatid: int,
            text: string (max: 512 chars)
            options?: {/* RESERVED IN DEV*/}
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int }
    Status: 200 - Success
            201 - NullParameter
            202 - NoAuth
            203 - TextLenght
            204 - ChatNotExist
            205 - ChatNoAccess
            206 - NoPermission
            209 - InternalError
```
#### Client:Message:Pull
Pull messages from chat
```
[POST] /api/v0/client/messages/pull
    Args: JSON { 
            chatid: int,
            options?: {
              offset: int (default: last)
              count: int (default: 1, maximum: 100)
            }
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int, messages?: Message[] }
    Status: 210 - Success
            211 - NullParameter
            212 - NoAuth
            213 - ChatNotExist
            214 - ChatNoAccess
            219 - InternalError
```
#### Client:Message:Remove
Remove message from chat
```
[POST] /api/v0/client/messages/remove
    Args: JSON { 
            chatid: int
            messageid: int (localid of message in chat)
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int }
    Status: 220 - Success
            221 - NullParameter
            222 - NoAuth
            223 - ChatNotExist
            224 - ChatNoAccess
            225 - MessageNotFound
            226 - NoPermission
            229 - InternalError
```
#### Client:Message:Edit
Edit message in chat
```
[POST] /api/v0/client/messages/edit
    Args: JSON { 
            chatid: int
            messageid: int (localid of message in chat)
            text: string (new text)
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int }
    Status: 230 - Success
            231 - NullParameter
            232 - NoAuth
            233 - ChatNotExist
            234 - ChatNoAccess
            235 - MessageNotFound
            236 - NoPermission
            237 - TextLenght
            239 - InternalError
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
    Status: 300 - Success
            301 - NullParameter
            302 - NoAuth
            309 - InternalError
```
#### Client:Chat:Create
Create new chat
```
[POST] /api/v0/client/chat/create
    Args: JSON {
            userid: int[] - ID of users
            title: string
            description?: string
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int, chat?: Chat }
    Status: 310 - Success
            311 - NullParameter
            312 - NoAuth
            313 - TitleFormat
            314 - DescriptionFormat
            319 - InternalError
```
#### Client:Chat:Clear
Clear all message in chat
```
[POST] /api/v0/client/chat/clear
    Args: JSON {
            chatid: int
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int, affected: int }
    Status: 320 - Success
            321 - NullParameter
            322 - NoAuth
            323 - ChatNotExist
            324 - ChatNoAccess
            325 - NoPermission
            329 - InternalError
```
#### Client:Chat:Remove
Remove chat
```
[POST] /api/v0/client/chat/remove
    Args: JSON {
            chatid: int
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int }
    Status: 330 - Success
            331 - NullParameter
            332 - NoAuth
            333 - ChatNotExist
            334 - ChatNoAccess
            335 - NoPermission
            339 - InternalError
```
#### Client:Chat:Info
Get info about chat
```
[POST] /api/v0/client/chat/info
    Args: JSON {
            chatid: int
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int, info?: ChatInfoObj }
    Status: 340 - Success
            341 - NullParameter
            342 - NoAuth
            343 - ChatNotExist
            344 - ChatNoAccess
            349 - InternalError
```
#### Client:Chat:SetInfo
Set chat title or description
```
[POST] /api/v0/client/chat/setinfo
    Args: JSON {
            chatid: int
            title?: string
            description?: string
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int }
    Status: 350 - Success
            351 - NullParameter
            352 - NoAuth
            353 - ChatNotExist
            354 - ChatNoAccess
            355 - NoPermission
            357 - TitleFormat
            358 - DescriptionFormat
            359 - InternalError
```
#### Client:Chat:AddUser
Add user into chat
```
[POST] /api/v0/client/chat/adduser
    Args: JSON {
            chatid: int
            userid: int
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int }
    Status: 360 - Success
            361 - NullParameter
            362 - NoAuth
            363 - ChatNotExist
            364 - ChatNoAccess
            365 - UserNotFound
            367 - AlradyInGroup
            368 - NoPermission
            369 - InternalError
```
#### Client:Chat:RemoveUser
Remove user from chat
```
[POST] /api/v0/client/chat/removeuser
    Args: JSON {
            chatid: int
            userid: int
          }
    Header: token, session
    Return: JSON { ok: boolean, status: int }
    Status: 370 - Success
            371 - NullParameter
            372 - NoAuth
            373 - ChatNotExist
            374 - ChatNoAccess
            375 - UserNotFound
            377 - UserNotInGroup
            378 - NoPermission
            379 - InternalError
```

## Objects
#### Message
```
Message {
  messageid: int - Global ID of message (always 0)
  localmessageid: int - Local ID of message
  chatid: int - ID of chat
  text: string
  senderid: int - Sender UserID    
  sentdate: date (UNIX) - Message send time as UNIX
  replyid: int - Reply UserID /*RESERVED IN DEV*/
  flag: int - /*RESERVED IN DEV*/
}
```
#### Chat
```
Chat {
  title: string
  description?: string
  chatid: int
  creatorid: int
  creationdate: date (UNIX)
  users: int[]
  isuser: boolean /*RESERVED IN DEV*/
  isgroup: boolean
}
```

#### ChatInfo
```
ChatInfoObj {
  title?: string
  description?: string
  users?: number[]
  messages?: number
  creatorid?: number
  creationdate?: Date
}

```
#### ChatFlags
```
enum MessageFlag {
    None = 0
    Edited = 1
}
```

## Variables
>Token - save in cookie, long decay (1mo) 64 chars

>Session - save in cookie, fast decay (2h), 32 chars