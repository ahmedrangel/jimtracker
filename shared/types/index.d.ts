import type { ErrorCode } from "~~/server/utils/errors";

declare global {
  type ErrorCode = typeof ErrorCode;

  interface UserInfo {
    wins: number;
    losses: number;
    gameName?: string;
    tagLine?: string;
    division?: string;
    tier?: string;
    lp?: number;
  }
}

export {};
