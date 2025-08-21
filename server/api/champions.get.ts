import { Dto, LolApi } from "twisted";

export default defineCachedEventHandler(async () => {
  const lol = new LolApi();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ChampionsDataDragon = new Dto.ChampionsDataDragon();
  const version = await lol.DataDragon.getVersions();
  const { data } = await $fetch<typeof ChampionsDataDragon>(`https://ddragon.leagueoflegends.com/cdn/${version[0]}/data/es_MX/champion.json`);
  return data;
}, {
  maxAge: 2 * 24 * 60 * 60,
  swr: false,
  getKey: () => "champions",
  group: "lol",
  name: "list"
});
