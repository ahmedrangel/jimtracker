export default defineEventHandler(async (event): Promise<InfoResponse> => {
  const now = Date.now();
  const checkInfo = await useStorage("cache").getItem<UserInfo>("info");
  if (checkInfo && (now - checkInfo.updatedAt < 2 * 60 * 1000)) {
    const dbInfo = await getDBInfo();
    return {
      user: checkInfo,
      ...dbInfo
    };
  }
  const config = useRuntimeConfig(event);
  const riotPolling = await runTask<UserInfo>("riotPolling");
  const [rankedData, userData] = await Promise.all([
    fetchRankedData(config),
    fetchUserData(config)
  ]);
  const dbInfo = await getDBInfo();
  if (riotPolling?.result) await useStorage("cache").setItem("info", { ...riotPolling.result, ...rankedData, ...userData, updatedAt: now });
  const info = { ...riotPolling.result!, ...rankedData, ...userData, updatedAt: now };
  return { user: info, ...dbInfo };
});
