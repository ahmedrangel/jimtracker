import { Constants, LolApi, RiotApi } from "twisted";

export default defineEventHandler(async (event): Promise<{ user?: UserInfo, stats?: { [key: string]: any } }> => {
  const config = useRuntimeConfig(event);
  const storage = useStorage("cache");
  let info = (await storage.getItem<UserInfo>("info")) || undefined;
  if (!info) {
    const riot = new RiotApi(config.riot.apiKey);
    const lol = new LolApi(config.riot.apiKey);
    const accountData = await riot.Account.getByPUUID(config.riot.jimPuuid, Constants.RegionGroups.AMERICAS);
    const leagueData = await lol.League.byPUUID(config.riot.jimPuuid, Constants.Regions.LAT_NORTH);
    const rankedData = leagueData.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
    if (rankedData) {
      const user = {
        wins: rankedData.wins,
        losses: rankedData.losses,
        gameName: accountData.response.gameName,
        tagLine: accountData.response.tagLine,
        division: rankedData.rank,
        tier: rankedData.tier,
        lp: rankedData.leaguePoints,
        updatedAt: Date.now()
      };
      await storage.setItem<UserInfo>("info", user);
      info = user;
    }
  }
  return {
    user: info,
    stats: info
  };
});
