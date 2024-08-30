export enum ErrorCodeEnum {
  NoContentCanBeModified = 1000,

  NoUpdateAvailableError = 10000,
  ManifestNotFound = 10001,
  AssetNotFound = 10002,
  RollbackBadProtocolVersion = 10003,
  InvalidExpoEmbeddedUpdateId = 10004,
  RollbackAtNotFound = 10005,

  AuthFailUserNotExist = 20000,
  AuthFail = 20001,

  UserNotFound = 30000,
  UserExist = 30001,

  TeamNotFound = 40000,
  TeamAlreadyExists = 40001,
  TeamMemberAlreadyExists = 40002,
  TeamMemberNotFound = 40003,

  ServerNotIdempotent = 50000,
}

export const ErrorCode = Object.freeze<Record<ErrorCodeEnum, [string, number]>>(
  {
    [ErrorCodeEnum.NoContentCanBeModified]: ['no content can be modified', 400],
    [ErrorCodeEnum.NoUpdateAvailableError]: ['no update available', 304],
    [ErrorCodeEnum.ManifestNotFound]: ['manifest not found', 404],
    [ErrorCodeEnum.AssetNotFound]: ['asset not found', 404],

    [ErrorCodeEnum.RollbackBadProtocolVersion]: [
      'Rollbacks not supported on protocol version 0',
      400,
    ],
    [ErrorCodeEnum.InvalidExpoEmbeddedUpdateId]: [
      'Invalid Expo-Embedded-Update-ID request header specified.',
      400,
    ],
    [ErrorCodeEnum.RollbackAtNotFound]: ['RollbackedAt not found', 400],

    [ErrorCodeEnum.AuthFailUserNotExist]: ['auth failed, user not exist', 400],
    [ErrorCodeEnum.AuthFail]: [
      'auth failed, please check your username and password',
      400,
    ],
    [ErrorCodeEnum.UserNotFound]: ['user not found', 404],
    [ErrorCodeEnum.UserExist]: ['user already exist', 400],
    [ErrorCodeEnum.TeamNotFound]: ['team not found', 404],
    [ErrorCodeEnum.TeamAlreadyExists]: ['team already exists', 400],
    [ErrorCodeEnum.TeamMemberAlreadyExists]: [
      'team member already exists',
      400,
    ],
    [ErrorCodeEnum.TeamMemberNotFound]: ['team member not found', 404],
    [ErrorCodeEnum.ServerNotIdempotent]: ['server not idempotent', 500],
  },
);
