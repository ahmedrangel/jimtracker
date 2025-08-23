import { Constants, LolApi, RiotApi } from "twisted";
import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import type { NitroRuntimeConfig } from "nitropack/types";

export const constants = {
  riotPuuid: "TCnuihsZ4HD4MLHJuV6Y_jccewxkjw62TAL_p905wJvysMBwyeVNmLLtqhiIkSYmec3_1xA9la8pJw",
  twitchId: "24534372"
};

export const fetchUserData = async (config: NitroRuntimeConfig): Promise<UserInfo | undefined> => {
  const riot = new RiotApi(config.riot.apiKey);
  const lol = new LolApi(config.riot.apiKey);
  const twitchAuth = new AppTokenAuthProvider(config.twitch.clientId, config.twitch.clientSecret);
  const twitch = new ApiClient({ authProvider: twitchAuth });
  const [accountData, leagueData, spectatorData, twitchStream] = await Promise.all([
    riot.Account.getByPUUID(constants.riotPuuid, Constants.RegionGroups.AMERICAS),
    lol.League.byPUUID(constants.riotPuuid, Constants.Regions.LAT_NORTH),
    lol.SpectatorV5.activeGame(constants.riotPuuid, Constants.Regions.LAT_NORTH),
    twitch.streams.getStreamByUserId(constants.twitchId)
  ]);

  const rankedData = leagueData.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
  if (!rankedData) return;
  return {
    wins: rankedData.wins,
    losses: rankedData.losses,
    gameName: accountData.response.gameName,
    tagLine: accountData.response.tagLine,
    division: rankedData.rank,
    tier: rankedData.tier,
    lp: rankedData.leaguePoints,
    updatedAt: Date.now(),
    isLiveTwitch: Boolean(twitchStream?.startDate),
    isIngame: Boolean(spectatorData?.response?.gameQueueConfigId === 420)
  };
};
