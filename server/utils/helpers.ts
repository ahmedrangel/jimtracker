import { Constants, LolApi, RiotApi } from "twisted";
import type { NitroRuntimeConfig } from "nitropack/types";
import twitchApi from "./twitch";

export const constants = {
  riotPuuid: "TCnuihsZ4HD4MLHJuV6Y_jccewxkjw62TAL_p905wJvysMBwyeVNmLLtqhiIkSYmec3_1xA9la8pJw",
  twitchId: "24534372"
};

export const fetchUserData = async (config: NitroRuntimeConfig): Promise<UserLeague> => {
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

export const fetchLiveData = async (config: NitroRuntimeConfig): Promise<LiveInfo> => {
  const lol = new LolApi(config.riot.apiKey);
  const twitch = new twitchApi(config.twitch.clientId, config.twitch.clientSecret);
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
