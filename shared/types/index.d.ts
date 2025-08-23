import type { ErrorCode } from "~~/server/utils/errors";

declare global {
  type ErrorCode = typeof ErrorCode;

  interface UserInfo extends RankInfo {
    wins: number;
    losses: number;
    gameName?: string;
    tagLine?: string;
    updatedAt: number;
    isLiveTwitch: boolean;
    isIngame: boolean;
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

  interface History extends Omit<MatchData, "puuid">, RankInfo {}

  interface RankInfo {
    tier?: string | null;
    division?: string | null;
    lp?: number | null;
  }

  interface InfoResponse {
    user?: UserInfo;
    history?: History[];
    recent?: History[];
    highest?: RankInfo;
    lowest?: RankInfo;
  }
}

export {};
