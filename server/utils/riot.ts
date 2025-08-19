import { RiotAPI } from "@fightmegg/riot-api";

export const riotAPI = (token: string) => {
  return new RiotAPI(token);
};
