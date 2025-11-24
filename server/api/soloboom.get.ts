import { load } from "cheerio";

export default defineCachedEventHandler(async () => {
  const storage = useStorage("cache");
  const info = await storage.getItem<UserLeague>("info-soloboom");
  if (!info) {
    throw createError({ statusCode: 404, statusMessage: "SoloBoom info not found", fatal: true });
  }
  const soloboomScrape = await $fetch<string>("https://soloboom.net/leaderboard", { responseType: "text", timeout: 5000 }).catch(() => null);
  if (!soloboomScrape) {
    throw createError({ statusCode: 503, statusMessage: "SoloBoom leaderboard is currently unavailable", fatal: true });
  }
  const html = load(soloboomScrape);
  const row = html(`td:contains(${info.gameName}-#${info.tagLine})`).parent();
  const soloboomRank = row.find("td").eq(0).text().trim();
  return {
    rank: soloboomRank
  };
}, {
  maxAge: 5 * 60 * 1000, // 5 minutes
  swr: false,
  getKey: () => "rank",
  group: "api",
  name: "soloboom"
});
