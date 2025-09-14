export default defineEventHandler(async (): Promise<InfoResponse> => {
  const now = Date.now();
  const checkInfo = await useStorage("cache").getItem<UserInfo>("info");
  const dbInfo = await getDBInfo();
  if (checkInfo && (now - checkInfo.updatedAt < 2 * 60 * 1000)) {
    const dbInfo = await getDBInfo();
    return {
      user: checkInfo,
      ...dbInfo
    };
  }
  const riotPolling = await runTask<UserInfo>("riotPolling");
  if (riotPolling?.result) await useStorage("cache").setItem("info", { ...riotPolling.result, updatedAt: now });
  const info = { ...riotPolling.result!, updatedAt: now };
  return { user: info, ...dbInfo };
});
