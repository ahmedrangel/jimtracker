import { LolApi } from "twisted";

export default defineEventHandler(async (event): Promise<InfoResponse> => {
  // if (import.meta.dev) return $fetch<InfoResponse>(`${SITE.url}/api/info`);
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const soloboom = query.soloboom === "true";
  const puuid = soloboom ? constants.soloboomPuuids[2025] : constants.riotPuuid;
  const key = soloboom ? "info-soloboom" : `info${query.season ? `-${query.season}` : ""}`;
  const storage = useStorage("cache");
  let [leagueInfo, liveGame, currentSeason] = await Promise.all([
    storage.getItem<UserLeague>(key),
    storage.getItem<LiveGame>(`live:${key}`),
    storage.getItem<number>("current-season")
  ]);
  if (!currentSeason) {
    const lol = new LolApi();
    const versionData = await lol.DataDragon.getVersions();
    currentSeason = Number(versionData?.[0]?.split(".")?.[0] || 0);
    if (currentSeason) await storage.setItem("current-season", currentSeason);
  }
  const liveInfo = await storage.getItem<LiveStreamInfo>("live-info");
  if (!leagueInfo) {
    const [userData, liveData] = await Promise.all([
      fetchUserData(config, puuid),
      fetchLiveData(config, puuid)
    ]);
    leagueInfo = { ...userData };
    liveGame = { ...liveData };
    await Promise.all([
      storage.setItem<UserLeague>(key, userData),
      storage.setItem<LiveGame>(`live:${key}`, liveGame)
    ]);
  }

  const info: UserInfo = { ...leagueInfo!, ...liveGame!, ...liveInfo! };

  const dbInfo = await getDBInfo({
    puuid,
    season: query.season ? Number(query.season) : currentSeason,
    fullHistory: query.season ? false : true
  });

  return {
    user: info,
    ...dbInfo
  };
});
