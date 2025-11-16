import { load } from "cheerio";

export default defineEventHandler(async () => {
  const storage = useStorage("cache");
  const soloBoomRankData = await storage.getItem<{ rank: string, updatedAt: number }>("soloboom-rank");
  const info = await storage.getItem<UserLeague>("info-soloboom");
  if (!info) return;
  const now = Date.now();
  if (soloBoomRankData && (now - soloBoomRankData.updatedAt < 5 * 60 * 1000)) { // 5 minutes
    return {
      rank: soloBoomRankData.rank
    };
  }
  const soloboomScrape = await $fetch<string>("https://soloboom.net/leaderboard", { responseType: "text", timeout: 5000 }).catch(() => null);
  if (soloboomScrape) {
    const html = load(soloboomScrape);
    const row = html(`td:contains(${info.gameName}-#${info.tagLine})`).parent();
    const soloboomRank = row.find("td").eq(0).text().trim();
    const updatedAt = Date.now();
    await storage.setItem<{ rank: string, updatedAt: number }>("soloboom-rank", { rank: soloboomRank || "", updatedAt });
    return {
      rank: soloboomRank
    };
  }
});
