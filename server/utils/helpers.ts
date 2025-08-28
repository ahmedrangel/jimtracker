import { Constants, LolApi, RiotApi } from "twisted";
import type { RuntimeConfig } from "nuxt/schema";
import twitchApi from "./twitch";

export const fetchUserData = async (config: RuntimeConfig): Promise<UserLeague> => {
  const riot = new RiotApi(config.riot.apiKey);
  const lol = new LolApi(config.riot.apiKey);
  const [accountData, leagueData] = await Promise.all([
    riot.Account.getByPUUID(constants.riotPuuid, Constants.RegionGroups.AMERICAS),
    lol.League.byPUUID(constants.riotPuuid, Constants.Regions.LAT_NORTH)
  ]);

  const rankedData = leagueData.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
  return {
    wins: rankedData?.wins || 0,
    losses: rankedData?.losses || 0,
    gameName: accountData.response.gameName,
    tagLine: accountData.response.tagLine,
    division: rankedData?.rank,
    tier: rankedData?.tier,
    lp: rankedData?.leaguePoints
  };
};

export const fetchLiveData = async (config: RuntimeConfig): Promise<LiveInfo> => {
  const lol = new LolApi(config.riot.apiKey);
  const twitch = new twitchApi(config.twitch.clientId, config.twitch.clientSecret);
  const [twitchToken] = await Promise.all([
    twitch.generateToken()
  ]);
  twitch.setAuthToken(twitchToken.access_token);
  const [spectatorData, twitchStream] = await Promise.all([
    lol.SpectatorV5.activeGame(constants.riotPuuid, Constants.Regions.LAT_NORTH).catch(() => null),
    twitch.getStreamByUserId(constants.twitchId).catch(() => null)
  ]);

  return {
    updatedAt: Date.now(),
    isLiveTwitch: Boolean(twitchStream?.started_at),
    isIngame: Boolean(spectatorData?.response?.gameQueueConfigId === 420)
  };
};
