import { load } from "cheerio";

export default defineEventHandler(async (event): Promise<InfoResponse> => {
  // if (import.meta.dev) return $fetch<InfoResponse>(`${SITE.url}/api/info`);
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const soloboom = query.soloboom === "true";
  const puuid = soloboom ? constants.soloboomPuuids[2025] : constants.riotPuuid;
  const key = soloboom ? "info-soloboom" : "info";
  const storage = useStorage("cache");
  let leagueInfo = await storage.getItem<UserLeague>(key);
  let liveInfo = await storage.getItem<LiveInfo>("live-info");
  if (!leagueInfo || !liveInfo) {
    const [userData, liveData] = await Promise.all([
      fetchUserData(config, puuid),
      fetchLiveData(config, puuid)
    ]);
    leagueInfo = { ...userData };
    liveInfo = { ...liveData };
    await Promise.all([
      storage.setItem<UserLeague>(key, userData),
      storage.setItem<LiveInfo>("live-info", liveInfo)
    ]);
  }

  const info: UserInfo = { ...leagueInfo!, ...liveInfo! };

  const dbInfo = await getDBInfo(puuid);

  if (soloboom) {
    const soloBoomRankData = await storage.getItem<{ rank: string, updatedAt: number }>("soloboom-rank");
    const now = Date.now();
    if (soloBoomRankData && (now - soloBoomRankData.updatedAt < 5 * 60 * 1000)) { // 5 minutes
      info.soloboomRank = soloBoomRankData.rank ? parseInt(soloBoomRankData.rank) : undefined;
    }
    else {
      const soloboomScrape = await $fetch<string>("https://soloboom.net/leaderboard", { responseType: "text", timeout: 5000 }).catch(() => null);
      if (soloboomScrape) {
        const html = load(soloboomScrape);
        const row = html(`td:contains(${info.gameName}-#${info.tagLine})`).parent();
        const soloboomRank = row.find("td").eq(0).text().trim();
        const updatedAt = Date.now();
        await storage.setItem<{ rank: string, updatedAt: number }>("soloboom-rank", { rank: soloboomRank || "", updatedAt });
        info.soloboomRank = soloboomRank ? parseInt(soloboomRank) : undefined;
      }
    }
  }

  return {
    user: info,
    ...dbInfo
  };
});
