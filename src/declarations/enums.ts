
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