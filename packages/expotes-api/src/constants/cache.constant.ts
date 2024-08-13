export const RedisDelimiter = ':';

export enum RedisKeys {
  AvatarStore = 'avatar_store',

  JWTStore = 'jwt_store',
  /* Session */
  SessionStore = 'session',
  SessionsStore = 'sessions',
  ValidateCodeStore = 'validate_code',
  TeamUserStore = 'team_user',

  /** HTTP 请求缓存 */
  HTTPCache = 'http_cache',

  ConfigCache = 'config_cache',

  /** 最大在线人数 */
  MaxOnlineCount = 'max_online_count',

  /* Forum */
  Post = 'post',
  User = 'user',
  Like = 'like',
  Dislike = 'dislike',
}

export const SESSION_COOKIE_NAME = 'JST';
export const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days
