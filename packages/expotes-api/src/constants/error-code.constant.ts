export enum ErrorCodeEnum {
  NoContentCanBeModified = 1000,

  PostNotFound = 10000,
  PostExist = 10001,
  CategoryNotFound = 10002,
  CategoryCannotDeleted = 10003,
  CategoryAlreadyExists = 10004,

  AuthFailUserNotExist = 20000,
  AuthFail = 20001,

  UserNotFound = 30000,
  UserExist = 30001,

  TeamNotFound = 40000,
  TeamAlreadyExists = 40001,
  TeamMemberAlreadyExists = 40002,
  TeamMemberNotFound = 40003,
}

export const ErrorCode = Object.freeze<Record<ErrorCodeEnum, [string, number]>>(
  {
    [ErrorCodeEnum.NoContentCanBeModified]: ['no content can be modified', 400],
    [ErrorCodeEnum.PostNotFound]: ['post not found', 404],
    [ErrorCodeEnum.PostExist]: ['post already exist', 400],
    [ErrorCodeEnum.CategoryNotFound]: ['category not found', 404],
    [ErrorCodeEnum.CategoryCannotDeleted]: [
      'there are other posts in this category, cannot be deleted',
      400,
    ],
    [ErrorCodeEnum.CategoryAlreadyExists]: ['category already exists', 400],
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
  },
);
