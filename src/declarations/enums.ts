
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
  Success             = 230,
  NullParameter       = 231,
  NoAuth              = 232,
  InternalError       = 239
}
export enum CreateChatResultCode {
  Success             = 240,
  NullParameter       = 241,
  NoAuth              = 242,
  TitleFormat         = 243,
  InternalError       = 249
}
export enum ClearChatResultCode {
  Success             = 250,
  NullParameter       = 251,
  NoAuth              = 252,
  ChatNotExist        = 253,
  ChatNoAccess        = 254,
  InternalError       = 259
}
export enum RemoveChatResultCode {
  Success             = 260,
  NullParameter       = 261,
  NoAuth              = 262,
  ChatNotExist        = 263,
  ChatNoAccess        = 264,
  InternalError       = 269
}
export enum ChatInfoResultCode {
  Success             = 270,
  NullParameter       = 271,
  NoAuth              = 272,
  ChatNotExist        = 273,
  ChatNoAccess        = 274,
  InternalError       = 279
}