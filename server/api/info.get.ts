export default defineEventHandler(async (event): Promise<InfoResponse> => {
  // if (import.meta.dev) return $fetch<InfoResponse>(`${SITE.url}/api/info`);
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const soloboom = query.soloboom === "true";
  const puuid = soloboom ? constants.soloboomPuuids[2025] : constants.riotPuuid;
  const key = soloboom ? "info-soloboom" : "info";
  const storage = useStorage("cache");
  let leagueInfo = await storage.getItem<UserLeague>(key);
  let liveInfo = await storage.getItem<LiveInfo>(`live:${key}`);
  if (!leagueInfo || !liveInfo) {
    const [userData, liveData] = await Promise.all([
      fetchUserData(config, puuid),
      fetchLiveData(config, puuid)
    ]);
    leagueInfo = { ...userData };
    liveInfo = { ...liveData };
    await Promise.all([
      storage.setItem<UserLeague>(key, userData),
      storage.setItem<LiveInfo>(`live:${key}`, liveInfo)
    ]);
  }

  const info: UserInfo = { ...leagueInfo!, ...liveInfo! };

  const dbInfo = await getDBInfo(puuid);

  return {
    user: info,
    ...dbInfo
  };
});
