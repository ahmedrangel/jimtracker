import { Constants, LolApi } from "twisted";

export const polling = async (puuid: string, key: string) => {
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

  const lastMatchData = await lol.MatchV5.list(puuid, Constants.RegionGroups.AMERICAS, {
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
      const participant = matchResponse.info.participants.find(p => p.puuid === puuid);
      userData = {
        gameName: participant!.riotIdGameName,
        tagLine: participant!.riotIdTagline
      };
      dataToInsert.push({
        match_id: matchResponse.metadata.matchId,
        puuid,
        kills: participant?.kills || 0,
        deaths: participant?.deaths || 0,
        assists: participant?.assists || 0,
        is_remake: participant?.gameEndedInEarlySurrender ? 1 : 0,
        result: participant?.win ? 1 : 0,
        champion_id: participant!.championId,
        is_surrender: participant?.gameEndedInSurrender || participant?.gameEndedInEarlySurrender ? 1 : 0,
        date: matchResponse.info.gameStartTimestamp + (matchResponse.info.gameDuration * 1000),
        duration: matchResponse.info.gameDuration * 1000,
        season: parseInt(matchResponse.info?.gameVersion?.split(".")?.[0] || "0")
      });
    }
    if (dataToInsert.length) {
      const user = await fetchRankedData(config, puuid);
      userData = { ...userData, ...user };
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
          snapshot_lp: user.lp,
          snapshot_wins: user.wins,
          snapshot_losses: user.losses
        }).onConflictDoNothing().run();
      }
    }
  }

  const [currentInfo, currentLiveInfo] = await Promise.all([
    storage.getItem<UserInfo>(key),
    storage.getItem<LiveGame>(`live:${key}`)
  ]);
  if (currentInfo) {
    const liveData = await fetchLiveData(config, puuid);
    if (!Object.keys(userData).length && (liveData.isIngame !== currentLiveInfo?.isIngame)) {
      const user = { ...currentInfo, updatedAt: Date.now() };
      await Promise.all([
        storage.setItem<UserInfo>(key, user),
        storage.setItem<LiveGame>(`live:${key}`, { ...currentLiveInfo, ...liveData })
      ]);
      return { result: user };
    }
    else if (Object.keys(userData).length) {
      const user = { ...currentInfo, ...userData, updatedAt: Date.now() };
      await Promise.all([
        storage.setItem<UserInfo>(key, user),
        storage.setItem<LiveGame>(`live:${key}`, { ...currentLiveInfo, ...liveData })
      ]);
      return { result: user };
    }
    else {
      return { result: { ...currentInfo } };
    }
  }
  return { result: null };
};
