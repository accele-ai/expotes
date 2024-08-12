import type { Format } from "typia/lib/tags/Format";

export type SessionResult = {
  value: string;
  expires: string & Format<"date-time">;
};
