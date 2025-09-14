export default defineEventHandler(async (event): Promise<InfoResponse> => {
  // if (import.meta.dev) return $fetch<InfoResponse>(`${SITE.url}/api/info`);
  const config = useRuntimeConfig(event);
  const storage = useStorage("cache");
  let info = (await storage.getItem<UserInfo>("info")) || undefined;
  if (!info) {
    const [userData, liveData] = await Promise.all([
      fetchUserData(config),
      fetchLiveData(config)
    ]);
    info = { ...userData, ...liveData };
    await storage.setItem<UserInfo>("info", info);
  }

  const dbInfo = await getDBInfo();

  return {
    user: info,
    ...dbInfo
  };
});
