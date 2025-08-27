import type { ErrorCode } from "~~/server/utils/errors";

declare global {
  type ErrorCode = typeof ErrorCode;

  interface UserLeague extends RankInfo {
    wins: number;
    losses: number;
    gameName?: string;
    tagLine?: string;
  }

  interface LiveInfo {
    updatedAt: number;
    isLiveTwitch: boolean;
    isLiveKick: boolean;
    isIngame: boolean;
  }

  interface UserInfo extends UserLeague, LiveInfo {}

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
    mostPlayed?: any;
    highestWinRate?: any;
  }

  interface ChartMatchData extends History {
    value: number;
    champion: string;
  }

  interface ChartXData {
    value: number;
    data: ChartMatchData | ChartMatchData[];
  }

  interface ChartLabelsAndData {
    labels: string[];
    data: ChartXData[];
  }

  interface TooltipContent {
    label: string;
    rankDisplay: string;
    changeText: string;
    changeIcon: string;
    changeColor: string;
    dataTier: string;
    data: ChartMatchData | ChartMatchData[];
  }
}

export {};
