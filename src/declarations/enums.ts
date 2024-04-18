
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
  NicknameFormat      = 115,
  NicknameBusy        = 116,
  InternalError       = 119
}
export enum UserInfoResultCode {
  Success             = 120,
  NullParameter       = 121,
  NoAuth              = 122,
  InternalError       = 129
}
export enum SetUserInfoResultCode {
  Success             = 130,
  NullParameter       = 131,
  NoAuth              = 132,
  NicknameFormat      = 133,
  NicknameBusy        = 134,
  InternalError       = 139
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
export enum RemoveMessageResultCode {
  Success             = 220,
  NullParameter       = 221,
  NoAuth              = 222,
  ChatNotExist        = 223,
  ChatNoAccess        = 224,
  MessageNotFound     = 225,
  NoPermission        = 226,
  InternalError       = 229
}
export enum EditMessageResultCode {
  Success             = 230,
  NullParameter       = 231,
  NoAuth              = 232,
  ChatNotExist        = 233,
  ChatNoAccess        = 234,
  MessageNotFound     = 235,
  NoPermission        = 236,
  TextLenght          = 237,
  InternalError       = 239
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
  DescriptionFormat   = 314,
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
export enum SetChatInfoResultCode {
  Success             = 350,
  NullParameter       = 351,
  NoAuth              = 352,
  ChatNotExist        = 353,
  ChatNoAccess        = 354,
  NoPermission        = 355,
  TitleFormat         = 357,
  DescriptionFormat   = 358,
  InternalError       = 359
}
export enum AddUserResultCode {
  Success             = 360,
  NullParameter       = 361,
  NoAuth              = 362,
  ChatNotExist        = 363,
  ChatNoAccess        = 364,
  UserNotFound        = 365,
  AlradyInGroup       = 366,
  NoPermission        = 367,
  InternalError       = 369
}
export enum RemoveUserResultCode {
  Success             = 370,
  NullParameter       = 371,
  NoAuth              = 372,
  ChatNotExist        = 373,
  ChatNoAccess        = 374,
  UserNotFound        = 375,
  UserNotInGroup      = 376,
  NoPermission        = 377,
  InternalError       = 379
}


export enum MessageFlag {
    None = 0,
    Edited = 1,
    Image = 2,
}
