
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