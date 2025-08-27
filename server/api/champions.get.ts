import { LolApi } from "twisted";

export default defineCachedEventHandler(async () => {
  const lol = new LolApi();
  const { data } = await lol.DataDragon.getChampionList("es_MX");
  const champions = Object.values(data).map(champion => ({
    id: champion.key,
    name: champion.name
  }));
  return champions;
}, {
  maxAge: 2 * 24 * 60 * 60,
  swr: false,
  getKey: () => "champions",
  group: "lol",
  name: "list"
});
