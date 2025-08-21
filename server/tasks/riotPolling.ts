import { Constants, LolApi, RiotApi } from "twisted";

export default defineTask({
  meta: {
    name: "riotPolling",
    description: "Poll Riot API for updates"
  },
  async run (): Promise<{
    result: {
      success: boolean;
      data?: MatchData[];
      snapshot?: SnapshotData;
    };
  }> {
    const config = useRuntimeConfig();
    const DB = useDB();
    const storage = useStorage("cache");

    const latestSavedMatch = await DB.select({
      match_id: tables.history.match_id,
      date: tables.history.date
    }).from(tables.history).orderBy(desc(tables.history.date)).limit(1).all();

    const latestMatchId = latestSavedMatch[0]?.match_id || null;
    const startTime = latestSavedMatch[0]?.date || null;
    const lol = new LolApi(config.riot.apiKey);
    const riot = new RiotApi(config.riot.apiKey);

    const lastMatchData = await lol.MatchV5.list(config.riot.jimPuuid, Constants.RegionGroups.AMERICAS, {
      queue: 420,
      ...startTime ? { count: 5 } : { count: 1 },
      ...startTime && { startTime: Math.round(startTime / 1000) }
    });

    const dataToInsert = [];
    const snapshot = [];

    if (lastMatchData.response.length) {
      for (const match of lastMatchData.response) {
        if (latestMatchId && match === latestMatchId) {
          continue;
        }
        const matchData = await lol.MatchV5.get(match, Constants.RegionGroups.AMERICAS);
        const matchResponse = matchData.response;
        const participant = matchResponse.info.participants.find(p => p.puuid === config.riot.jimPuuid);
        dataToInsert.push({
          match_id: matchResponse.metadata.matchId,
          puuid: config.riot.jimPuuid,
          kills: participant?.kills || 0,
          deaths: participant?.deaths || 0,
          assists: participant?.assists || 0,
          is_remake: participant?.gameEndedInEarlySurrender ? 1 : 0,
          result: participant?.win ? 1 : 0,
          champion_id: participant!.championId,
          is_surrender: participant?.gameEndedInSurrender || participant?.gameEndedInEarlySurrender ? 1 : 0,
          date: matchResponse.info.gameStartTimestamp + (matchResponse.info.gameDuration * 1000),
          duration: matchResponse.info.gameDuration * 1000
        });
      }
      if (dataToInsert.length) {
        const [leagueSnapshot, accountData] = await Promise.all([
          lol.League.byPUUID(config.riot.jimPuuid, Constants.Regions.LAT_NORTH),
          riot.Account.getByPUUID(config.riot.jimPuuid, Constants.RegionGroups.AMERICAS)
        ]);
        const rankedData = leagueSnapshot.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
        if (rankedData) {
          const user = {
            wins: rankedData.wins,
            losses: rankedData.losses,
            gameName: accountData.response.gameName,
            tagLine: accountData.response.tagLine,
            division: rankedData.rank,
            tier: rankedData.tier,
            lp: rankedData.leaguePoints,
            updatedAt: Date.now()
          };
          await storage.setItem<UserInfo>("info", user);
          for (const entry of dataToInsert) {
            snapshot.push({
              division: rankedData.rank,
              tier: rankedData.tier,
              lp: rankedData.leaguePoints
            });
            await DB.insert(tables.history).values({
              ...entry,
              snapshot_division: rankedData.rank,
              snapshot_tier: rankedData.tier,
              snapshot_lp: rankedData.leaguePoints
            }).run();
          }
        }
      }
    }

    return {
      result: {
        success: true,
        data: dataToInsert,
        snapshot: snapshot?.[0]
      }
    };
  }
});
