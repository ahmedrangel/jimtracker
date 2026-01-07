import { Constants, LolApi, RiotApi } from "twisted";
import type { RuntimeConfig } from "nuxt/schema";

export { z } from "zod";

export const fetchRankedData = async (config: RuntimeConfig, puuid: string): Promise<RankedData> => {
  const lol = new LolApi(config.riot.apiKey);
  const leagueData = await lol.League.byPUUID(puuid, Constants.Regions.LAT_NORTH);
  const rankedData = leagueData.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
  return {
    wins: rankedData?.wins || 0,
    losses: rankedData?.losses || 0,
    division: rankedData?.rank,
    tier: rankedData?.tier,
    lp: rankedData?.leaguePoints
  };
};

export const fetchUserData = async (config: RuntimeConfig, puuid: string): Promise<UserLeague> => {
  const riot = new RiotApi(config.riot.apiKey);
  const [accountData, rankedData] = await Promise.all([
    riot.Account.getByPUUID(puuid, Constants.RegionGroups.AMERICAS),
    fetchRankedData(config, puuid)
  ]);

  return {
    wins: rankedData.wins,
    losses: rankedData.losses,
    gameName: accountData.response.gameName,
    tagLine: accountData.response.tagLine,
    division: rankedData?.division,
    tier: rankedData?.tier,
    lp: rankedData?.lp,
    updatedAt: Date.now()
  };
};

export const fetchLiveData = async (config: RuntimeConfig, puuid: string): Promise<LiveGame> => {
  const lol = new LolApi(config.riot.apiKey);
  const [spectatorData] = await Promise.all([
    lol.SpectatorV5.activeGame(puuid, Constants.Regions.LAT_NORTH).catch(() => null)
  ]);

  return {
    isIngame: Boolean(spectatorData?.response?.gameQueueConfigId === 420)
  };
};

export const getStreakCount = (history: HistoryData[]) => {
  history = history?.filter(h => !h.is_remake)?.toSorted((a, b) => b?.date - a?.date) || [];
  if (!history || history.length === 0) return 0;
  let count = 0;
  const lastResult = history[0]?.result;
  for (let i = 0; i < history.length; i++) {
    if (history[i]?.result === lastResult) {
      count++;
    }
    else {
      break;
    }
  }
  return lastResult ? count : -count;
};

export const getDBInfo = async (puuid: string) => {
  const DB = useDB();
  const countResult = await DB.select({
    count: count(tables.history.match_id)
  }).from(tables.history)
    .where(
      and(
        gte(tables.history.date, Date.now() - historyGraphConfig.daysLimit * 24 * 60 * 60 * 1000),
        eq(tables.history.puuid, puuid)
      )
    ).get();

  const matchesInDays = countResult?.count || 0;
  const dynamicLimit = Math.max(matchesInDays, historyGraphConfig.matchLimit);

  const [history, highest, lowest, mostPlayed] = await Promise.all([
    // History
    DB.select({
      match_id: tables.history.match_id,
      assists: tables.history.assists,
      kills: tables.history.kills,
      deaths: tables.history.deaths,
      champion_id: tables.history.champion_id,
      date: tables.history.date,
      result: tables.history.result,
      is_remake: tables.history.is_remake,
      division: tables.history.snapshot_division,
      tier: tables.history.snapshot_tier,
      lp: tables.history.snapshot_lp,
      duration: tables.history.duration,
      season: tables.history.season
    }).from(tables.history)
      .where(
        and(
          eq(tables.history.puuid, puuid)
        )
      )
      .orderBy(desc(tables.history.date))
      .limit(Math.ceil(dynamicLimit))
      .all(),

    // Highest
    DB.select({
      tier: tables.history.snapshot_tier,
      division: tables.history.snapshot_division,
      lp: tables.history.snapshot_lp
    }).from(tables.history)
      .where(
        and(
          eq(tables.history.puuid, puuid),
          isNotNull(tables.history.snapshot_division),
          isNotNull(tables.history.snapshot_tier)
        )
      )
      .orderBy(
        sql`CASE ${tables.history.snapshot_tier}
          WHEN 'CHALLENGER' THEN 0
          WHEN 'GRANDMASTER' THEN 1
          WHEN 'MASTER' THEN 2
          WHEN 'DIAMOND' THEN 3
          WHEN 'EMERALD' THEN 4
          WHEN 'PLATINUM' THEN 5
          WHEN 'GOLD' THEN 6
          WHEN 'SILVER' THEN 7
          WHEN 'BRONZE' THEN 8
          WHEN 'IRON' THEN 9
          ELSE 10
        END`,
        sql`CASE ${tables.history.snapshot_division}
          WHEN 'I' THEN 0
          WHEN 'II' THEN 1
          WHEN 'III' THEN 2
          WHEN 'IV' THEN 3
          ELSE 4
        END`,
        desc(tables.history.snapshot_lp)
      ).limit(1).get(),

    // Lowest
    DB.select({
      tier: tables.history.snapshot_tier,
      division: tables.history.snapshot_division,
      lp: tables.history.snapshot_lp
    }).from(tables.history)
      .where(
        and(
          eq(tables.history.puuid, puuid),
          isNotNull(tables.history.snapshot_division),
          isNotNull(tables.history.snapshot_tier)
        )
      )
      .orderBy(
        sql`CASE ${tables.history.snapshot_tier}
          WHEN 'IRON' THEN 0
          WHEN 'BRONZE' THEN 1
          WHEN 'SILVER' THEN 2
          WHEN 'GOLD' THEN 3
          WHEN 'PLATINUM' THEN 4
          WHEN 'EMERALD' THEN 5
          WHEN 'DIAMOND' THEN 6
          WHEN 'MASTER' THEN 7
          WHEN 'GRANDMASTER' THEN 8
          WHEN 'CHALLENGER' THEN 9
          ELSE 10
        END`,
        sql`CASE ${tables.history.snapshot_division}
          WHEN 'IV' THEN 0
          WHEN 'III' THEN 1
          WHEN 'II' THEN 2
          WHEN 'I' THEN 3
          ELSE 4
        END`,
        asc(tables.history.snapshot_lp)
      ).limit(1).get(),

    // Most Played champion
    DB.select({
      champion_id: tables.history.champion_id,
      count: sql<number>`COUNT(${tables.history.match_id}) as count`,
      wins: sql<number>`SUM(CASE WHEN ${tables.history.result} = 1 THEN 1 ELSE 0 END)`,
      losses: sql<number>`SUM(CASE WHEN ${tables.history.result} = 0 THEN 1 ELSE 0 END)`,
      kills: sql<number>`AVG(${tables.history.kills})`,
      deaths: sql<number>`AVG(${tables.history.deaths})`,
      assists: sql<number>`AVG(${tables.history.assists})`
    }).from(tables.history)
      .where(and(eq(tables.history.puuid, puuid), eq(tables.history.is_remake, 0)))
      .groupBy(tables.history.champion_id)
      .having(gte(sql`count`, 1)) // Al menos 1 partida jugada con el campeón
      .orderBy(desc(sql`count`), desc(sql`SUM(CASE WHEN ${tables.history.result} = 1 THEN 1 ELSE 0 END)`), desc(sql`(AVG(${tables.history.kills}) + AVG(${tables.history.assists})) / CASE WHEN AVG(${tables.history.deaths}) = 0 THEN 1 ELSE AVG(${tables.history.deaths}) END`))
      .limit(4)
      .all()
  ]);

  const streak = getStreakCount(history);

  return {
    history,
    highest,
    lowest,
    mostPlayed,
    streak
  };
};
