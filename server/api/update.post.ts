export default defineEventHandler(async (): Promise<InfoResponse> => {
  const now = Date.now();
  const checkInfo = await useStorage("cache").getItem<UserInfo>("info");
  if (checkInfo && (now - checkInfo.updatedAt < 2 * 60 * 1000)) {
    const dbInfo = await getDBInfo();
    return {
      user: checkInfo,
      ...dbInfo
    };
  }
  const [riotPolling, dbInfo] = await Promise.all([
    runTask<UserInfo>("riotPolling"),
    getDBInfo()
  ]);
  if (riotPolling?.result) await useStorage("cache").setItem("info", { ...riotPolling.result, updatedAt: now });
  const info = { ...riotPolling.result!, updatedAt: now };
  return { user: info, ...dbInfo };
});
