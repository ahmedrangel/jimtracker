import { LolApi } from "twisted";

export default defineEventHandler(async (event): Promise<InfoResponse> => {
  const now = Date.now();
  const query = getQuery(event);
  const soloboom = query.soloboom === "true";
  const puuid = soloboom ? constants.soloboomPuuids[2025] : constants.riotPuuid;
  const storage = useStorage("cache");
  const key = soloboom ? "info-soloboom" : "info";
  const pollingKey = soloboom ? "soloboomPolling" : "riotPolling";
  const [checkInfo] = await Promise.all([
    storage.getItem<UserInfo>(key)
  ]);

  let [season] = await Promise.all([
    storage.getItem<number>("current-season")
  ]);

  if (!season) {
    const lol = new LolApi();
    const versionData = await lol.DataDragon.getVersions();
    season = parseInt(versionData[0].split(".")[0]);
    await storage.setItem("current-season", season);
  }
  if (checkInfo && (now - checkInfo.updatedAt < 2 * 60 * 1000)) {
    const dbInfo = await getDBInfo({ puuid, season });
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
  const dbInfo = await getDBInfo({ puuid, season });
  if (pollingData?.result) await storage.setItem(key, { ...pollingData.result, ...userData, updatedAt: now });
  const [liveGame, liveStreamInfo] = await Promise.all([
    storage.getItem<LiveGame>(`live:${key}`),
    storage.getItem<LiveStreamInfo>("live-info")
  ]);
  const info = { ...pollingData.result!, ...userData, ...liveStreamInfo, ...liveGame, updatedAt: now };
  return { user: info, ...dbInfo };
});
