import { Constants, LolApi, RiotApi } from "twisted";
import type { RuntimeConfig } from "nuxt/schema";

export const fetchRankedData = async (config: RuntimeConfig): Promise<RankedData> => {
  const lol = new LolApi(config.riot.apiKey);
  const leagueData = await lol.League.byPUUID(constants.riotPuuid, Constants.Regions.LAT_NORTH);
  const rankedData = leagueData.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
  return {
    wins: rankedData?.wins || 0,
    losses: rankedData?.losses || 0,
    division: rankedData?.rank,
    tier: rankedData?.tier,
    lp: rankedData?.leaguePoints
  };
};

export const fetchUserData = async (config: RuntimeConfig): Promise<UserLeague> => {
  const riot = new RiotApi(config.riot.apiKey);
  const [accountData, rankedData] = await Promise.all([
    riot.Account.getByPUUID(constants.riotPuuid, Constants.RegionGroups.AMERICAS),
    fetchRankedData(config)
  ]);

  return {
    wins: rankedData.wins,
    losses: rankedData.losses,
    gameName: accountData.response.gameName,
    tagLine: accountData.response.tagLine,
    division: rankedData?.division,
    tier: rankedData?.tier,
    lp: rankedData?.lp
  };
};

export const fetchLiveData = async (config: RuntimeConfig): Promise<LiveInfo> => {
  const lol = new LolApi(config.riot.apiKey);
  const [spectatorData] = await Promise.all([
    lol.SpectatorV5.activeGame(constants.riotPuuid, Constants.Regions.LAT_NORTH).catch(() => null)
  ]);

  return {
    updatedAt: Date.now(),
    isIngame: Boolean(spectatorData?.response?.gameQueueConfigId === 420)
  };
};
