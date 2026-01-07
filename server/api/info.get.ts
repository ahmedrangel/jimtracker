export default defineEventHandler(async (event): Promise<InfoResponse> => {
  // if (import.meta.dev) return $fetch<InfoResponse>(`${SITE.url}/api/info?soloboom=true`);
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const soloboom = query.soloboom === "true";
  const year = query.year ? Number(query.year) : new Date().getFullYear();
  const puuid = soloboom ? constants.soloboomPuuids[year as keyof typeof constants.soloboomPuuids] : constants.riotPuuid;
  const key = soloboom ? "info-soloboom" : "info";
  const storage = useStorage("cache");
  let [leagueInfo, liveGame] = await Promise.all([
    storage.getItem<UserLeague>(key),
    storage.getItem<LiveGame>(`live:${key}`)
  ]);
  const liveInfo = await storage.getItem<LiveStreamInfo>("live-info");
  if (!leagueInfo || !liveInfo) {
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

  const dbInfo = await getDBInfo(puuid, year);

  return {
    user: info,
    ...dbInfo
  };
});
