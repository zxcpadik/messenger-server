
export enum AuthResultCode {
  Success             = 100,
  NullParameter       = 101,
  UsernameFormat      = 102,
  PasswordFormat      = 103,
  UserNotExists       = 104,
  PasswordIncorrect   = 105,
  InternalError       = 109
}
export enum RegisterResultCode {
  Success             = 110,
  NullParameter       = 111,
  UsernameFormat      = 112,
  PasswordFormat      = 113,
  UserAlreadyExists   = 114,
  InternalError       = 119
}

export enum MessagePushResultCode {
  Success             = 200,
  NullParameter       = 201,
  NoAuth              = 202,
  TextLenght          = 203,
  ChatNotExist        = 204,
  ChatNoAccess        = 205,
  NoPermission        = 206,
  InternalError       = 209
}
export enum MessagePullResultCode {
  Success             = 210,
  NullParameter       = 211,
  NoAuth              = 212,
  ChatNotExist        = 213,
  ChatNoAccess        = 214,
  InternalError       = 219
}

export enum GetUserChatsResultCode {
  Success             = 300,
  NullParameter       = 301,
  NoAuth              = 302,
  InternalError       = 309
}
export enum CreateChatResultCode {
  Success             = 310,
  NullParameter       = 311,
  NoAuth              = 312,
  TitleFormat         = 313,
  InternalError       = 319
}
export enum ClearChatResultCode {
  Success             = 320,
  NullParameter       = 321,
  NoAuth              = 322,
  ChatNotExist        = 323,
  ChatNoAccess        = 324,
  NoPermission        = 325,
  InternalError       = 329
}
export enum RemoveChatResultCode {
  Success             = 330,
  NullParameter       = 331,
  NoAuth              = 332,
  ChatNotExist        = 333,
  ChatNoAccess        = 334,
  NoPermission        = 335,
  InternalError       = 339
}
export enum ChatInfoResultCode {
  Success             = 340,
  NullParameter       = 341,
  NoAuth              = 342,
  ChatNotExist        = 343,
  ChatNoAccess        = 344,
  InternalError       = 349
}