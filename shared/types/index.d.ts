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
    updatedAt: number;
  }

  interface MatchData {
    match_id: string;
    puuid: string;
    kills: number;
    deaths: number;
    assists: number;
    is_remake: number;
    result: number;
    champion_id: number;
    is_surrender: number;
    date: number;
    duration: number;
  }

  interface SnapshotData {
    division: string;
    tier: string;
    lp: number;
  }
}

export {};
