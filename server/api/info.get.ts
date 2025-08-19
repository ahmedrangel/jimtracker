import { PlatformId, RiotAPITypes } from "@fightmegg/riot-api";

export default defineEventHandler(async (event): Promise<{ user?: UserInfo, stats?: { [key: string]: any } }> => {
  const config = useRuntimeConfig(event);
  const storage = useStorage("cache");
  let info = (await storage.getItem<UserInfo>("info")) || undefined;
  if (!info) {
    const riot = riotAPI(config.riot.apiKey);
    const accountData = await riot.account.getByPUUID({
      region: PlatformId.AMERICAS,
      puuid: config.riot.jimPuuid
    });
    const leagueData = await riot.league.getEntriesByPUUID({
      region: PlatformId.LA1,
      puuid: config.riot.jimPuuid
    });
    const rankedData = leagueData.find(entry => entry.queueType === RiotAPITypes.QUEUE.RANKED_SOLO_5x5);
    if (rankedData) {
      const user: UserInfo = {
        wins: rankedData.wins,
        losses: rankedData.losses,
        gameName: accountData.gameName,
        tagLine: accountData.tagLine,
        division: rankedData.rank as RiotAPITypes.DIVISION,
        tier: rankedData.tier as RiotAPITypes.TIER,
        lp: rankedData.leaguePoints
      };
      // await storage.setItem("info", user);
      info = user;
    }
  }
  return {
    user: info,
    stats: info
  };
});
