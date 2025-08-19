import type { RiotAPITypes } from "@fightmegg/riot-api";
import type { ErrorCode } from "~~/server/utils/errors";

declare global {
  type ErrorCode = typeof ErrorCode;
  type RiotAPITypes = typeof RiotAPITypes;

  interface UserInfo {
    wins: number;
    losses: number;
    gameName?: string;
    tagLine?: string;
    division: RiotAPITypes.DIVISION;
    tier: RiotAPITypes.TIER;
    lp: number;
  }
}

export {};
