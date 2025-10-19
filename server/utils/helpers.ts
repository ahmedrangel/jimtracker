import { Constants, LolApi, RiotApi } from "twisted";
import type { RuntimeConfig } from "nuxt/schema";

export { z } from "zod";

export const fetchRankedData = async (config: RuntimeConfig): Promise<RankedData> => {
  const lol = new LolApi(config.riot.apiKey);
  const leagueData = await lol.League.byPUUID(constants.riotPuuid, Constants.Regions.LAT_NORTH);
  const rankedData = leagueData.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
  return {
    wins: rankedData?.wins || 0,
    losses: rankedData?.losses || 0,
    division: rankedData?.rank,
    tier: rankedData?.tier,
    lp: rankedData?.leaguePoints
  };
};

export const fetchUserData = async (config: RuntimeConfig): Promise<UserLeague> => {
  const riot = new RiotApi(config.riot.apiKey);
  const [accountData, rankedData] = await Promise.all([
    riot.Account.getByPUUID(constants.riotPuuid, Constants.RegionGroups.AMERICAS),
    fetchRankedData(config)
  ]);

  return {
    wins: rankedData.wins,
    losses: rankedData.losses,
    gameName: accountData.response.gameName,
    tagLine: accountData.response.tagLine,
    division: rankedData?.division,
    tier: rankedData?.tier,
    lp: rankedData?.lp
  };
};

export const getDBInfo = async () => {
  const DB = useDB();
  const [history, highest, lowest, recent, mostPlayed] = await Promise.all([
    // History (últimos 30 días)
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
      duration: tables.history.duration
    }).from(tables.history)
      .where(
        and(
          gte(tables.history.date, Date.now() - 30 * 24 * 60 * 60 * 1000),
          eq(tables.history.puuid, constants.riotPuuid),
          isNotNull(tables.history.snapshot_division),
          isNotNull(tables.history.snapshot_tier)
        )
      ).orderBy(desc(tables.history.date)).all(),

    // Highest
    DB.select({
      tier: tables.history.snapshot_tier,
      division: tables.history.snapshot_division,
      lp: tables.history.snapshot_lp
    }).from(tables.history)
      .where(
        and(
          eq(tables.history.puuid, constants.riotPuuid),
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
          eq(tables.history.puuid, constants.riotPuuid),
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

    // Recent Matches (últimas 200 partidas)
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
      duration: tables.history.duration
    }).from(tables.history)
      .where(
        and(
          eq(tables.history.puuid, constants.riotPuuid),
          isNotNull(tables.history.snapshot_division),
          isNotNull(tables.history.snapshot_tier)
        )
      )
      .orderBy(desc(tables.history.date))
      .limit(200)
      .all(),

    // Most Played champion and calculated KDA average
    DB.select({
      champion_id: tables.history.champion_id,
      count: sql<number>`COUNT(${tables.history.match_id}) as count`,
      wins: sql<number>`SUM(CASE WHEN ${tables.history.result} = 1 THEN 1 ELSE 0 END)`,
      losses: sql<number>`SUM(CASE WHEN ${tables.history.result} = 0 THEN 1 ELSE 0 END)`,
      kills: sql<number>`AVG(${tables.history.kills})`,
      deaths: sql<number>`AVG(${tables.history.deaths})`,
      assists: sql<number>`AVG(${tables.history.assists})`
    }).from(tables.history)
      .where(and(eq(tables.history.puuid, constants.riotPuuid), eq(tables.history.is_remake, 0)))
      .groupBy(tables.history.champion_id)
      .having(gte(sql`count`, 5)) // Al menos 5 partidas jugadas con el campeón
      .orderBy(desc(sql`count`))
      .limit(4)
      .all()
  ]);
  return { history, highest, lowest, recent, mostPlayed };
};
