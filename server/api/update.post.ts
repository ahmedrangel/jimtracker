export default defineEventHandler(async (event): Promise<InfoResponse> => {
  const now = Date.now();
  const query = getQuery(event);
  const soloboom = query.soloboom === "true";
  const puuid = soloboom ? constants.soloboomPuuids[2025] : constants.riotPuuid;
  const key = soloboom ? "info-soloboom" : "info";
  const pollingKey = soloboom ? "soloboomPolling" : "riotPolling";
  const [checkInfo] = await Promise.all([
    useStorage("cache").getItem<UserInfo>(key)
  ]);
  if (checkInfo && (now - checkInfo.updatedAt < 2 * 60 * 1000)) {
    const dbInfo = await getDBInfo(puuid);
    return {
      user: checkInfo,
      ...dbInfo
    };
  }
  const config = useRuntimeConfig(event);
  const pollingData = await runTask<UserInfo>(pollingKey);
  const [userData] = await Promise.all([
    fetchUserData(config, puuid)
  ]);
  const dbInfo = await getDBInfo(puuid);
  if (pollingData?.result) await useStorage("cache").setItem(key, { ...pollingData.result, ...userData, updatedAt: now });
  const [liveGame, liveStreamInfo] = await Promise.all([
    useStorage("cache").getItem<LiveGame>(`live:${key}`),
    useStorage("cache").getItem<LiveStreamInfo>("live-info")
  ]);
  const info = { ...pollingData.result!, ...userData, ...liveStreamInfo, ...liveGame, updatedAt: now };
  return { user: info, ...dbInfo };
});
