import { Constants, LolApi } from "twisted";

export default defineTask({
  meta: {
    name: "riotPolling",
    description: "Poll Riot API for updates"
  },
  async run (): Promise<{
    result: {
      success: boolean;
      data?: MatchData[];
      snapshot?: RankInfo;
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

    const lastMatchData = await lol.MatchV5.list(constants.riotPuuid, Constants.RegionGroups.AMERICAS, {
      queue: 420,
      ...startTime ? { count: 5 } : { count: 1 },
      ...startTime && { startTime: Math.round(startTime / 1000) }
    });

    const dataToInsert = [];
    const snapshot = [];
    let userData = {};

    if (lastMatchData.response.length) {
      for (const match of lastMatchData.response) {
        if (latestMatchId && match === latestMatchId) {
          continue;
        }
        const matchData = await lol.MatchV5.get(match, Constants.RegionGroups.AMERICAS);
        const matchResponse = matchData.response;
        const participant = matchResponse.info.participants.find(p => p.puuid === constants.riotPuuid);
        userData = {
          gameName: participant!.riotIdGameName,
          tagLine: participant!.riotIdTagline
        };
        dataToInsert.push({
          match_id: matchResponse.metadata.matchId,
          puuid: constants.riotPuuid,
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
        const user = await fetchRankedData(config);
        userData = { ...userData, ...user };
        if (user.division && user.tier) {
          for (const entry of dataToInsert.toReversed()) {
            snapshot.push({
              division: user.division,
              tier: user.tier,
              lp: user.lp
            });
            await DB.insert(tables.history).values({
              ...entry,
              snapshot_division: user.division,
              snapshot_tier: user.tier,
              snapshot_lp: user.lp
            }).onConflictDoNothing().run();
          }
        }
      }
    }

    const currentInfo = await storage.getItem<UserInfo>("info");
    if (currentInfo) {
      const liveData = await fetchLiveData(config);
      if (!Object.keys(userData).length && (liveData.isIngame !== currentInfo.isIngame)) {
        const user = { ...currentInfo, ...liveData };
        await storage.setItem<UserInfo>("info", user);
      }
      else if (Object.keys(userData).length) {
        const user = { ...currentInfo, ...userData, ...liveData };
        await storage.setItem<UserInfo>("info", user);
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
