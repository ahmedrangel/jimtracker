export default defineEventHandler(async (event): Promise<InfoResponse> => {
  if (import.meta.dev) return $fetch<InfoResponse>(`${SITE.url}/api/info`);
  const config = useRuntimeConfig(event);
  const storage = useStorage("cache");
  const DB = useDB();
  let info = (await storage.getItem<UserInfo>("info")) || undefined;
  if (!info) {
    const [userData, liveData] = await Promise.all([
      fetchUserData(config),
      fetchLiveData(config)
    ]);
    info = { ...userData, ...liveData };
    await storage.setItem<UserInfo>("info", info);
  }

  const [history, highest, lowest, recent, mostPlayed, highestWinRate] = await Promise.all([
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
      is_surrender: tables.history.is_surrender,
      division: tables.history.snapshot_division,
      tier: tables.history.snapshot_tier,
      lp: tables.history.snapshot_lp,
      duration: tables.history.duration
    }).from(tables.history)
      .where(
        and(
          gte(tables.history.date, Date.now() - 30 * 24 * 60 * 60 * 1000),
          eq(tables.history.puuid, constants.riotPuuid)
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
          sql`${tables.history.snapshot_tier} IS NOT NULL`
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
          sql`${tables.history.snapshot_tier} IS NOT NULL`
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

    // Recent Matches (últimas 100 partidas)
    DB.select({
      match_id: tables.history.match_id,
      assists: tables.history.assists,
      kills: tables.history.kills,
      deaths: tables.history.deaths,
      champion_id: tables.history.champion_id,
      date: tables.history.date,
      result: tables.history.result,
      is_remake: tables.history.is_remake,
      is_surrender: tables.history.is_surrender,
      division: tables.history.snapshot_division,
      tier: tables.history.snapshot_tier,
      lp: tables.history.snapshot_lp,
      duration: tables.history.duration
    }).from(tables.history)
      .where(eq(tables.history.puuid, constants.riotPuuid))
      .orderBy(desc(tables.history.date))
      .limit(100)
      .all(),

    // Most Played champion and calculated KDA average
    DB.select({
      champion_id: tables.history.champion_id,
      count: sql`COUNT(${tables.history.match_id}) as count`,
      wins: sql`SUM(CASE WHEN ${tables.history.result} = 1 THEN 1 ELSE 0 END)`,
      losses: sql`SUM(CASE WHEN ${tables.history.result} = 0 THEN 1 ELSE 0 END)`,
      kills: sql`SUM(${tables.history.kills})`,
      deaths: sql`SUM(${tables.history.deaths})`,
      assists: sql`SUM(${tables.history.assists})`
    }).from(tables.history)
      .where(and(eq(tables.history.puuid, constants.riotPuuid), eq(tables.history.is_remake, 0)))
      .groupBy(tables.history.champion_id)
      .having(gte(sql`count`, 5)) // Al menos 5 partidas jugadas con el campeón
      .orderBy(desc(sql`count`))
      .limit(1)
      .get(),

    // Highest Win Rate champion and calculated KDA average
    DB.select({
      champion_id: tables.history.champion_id,
      count: sql`COUNT(${tables.history.match_id}) as count`,
      wins: sql`SUM(CASE WHEN ${tables.history.result} = 1 THEN 1 ELSE 0 END)`,
      losses: sql`SUM(CASE WHEN ${tables.history.result} = 0 THEN 1 ELSE 0 END)`,
      winrate: sql`SUM(CASE WHEN ${tables.history.result} = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(${tables.history.match_id}), 0) AS winrate`,
      kills: sql`SUM(${tables.history.kills})`,
      deaths: sql`SUM(${tables.history.deaths})`,
      assists: sql`SUM(${tables.history.assists})`
    }).from(tables.history)
      .where(and(eq(tables.history.puuid, constants.riotPuuid), eq(tables.history.is_remake, 0)))
      .having(gte(sql`count`, 5)) // Al menos 5 partidas jugadas con el campeón
      .groupBy(tables.history.champion_id)
      .orderBy(desc(sql`winrate`))
      .limit(1)
      .get()
  ]);

  return {
    user: info,
    history,
    highest,
    lowest,
    recent,
    mostPlayed,
    highestWinRate
  };
});
