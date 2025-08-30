import { Constants, LolApi } from "twisted";

export default defineEventHandler(async (event): Promise<void> => {
  const headers = getHeaders(event);
  const riotApiKey = headers["x-riot-api-key"];
  const config = useRuntimeConfig(event);
  if (!riotApiKey || (riotApiKey !== config.riot.apiKey)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const DB = useDB();
  const lol = new LolApi(config.riot.apiKey);
  let index = 0;
  let finished = false;
  const existingMatches = await DB.select({ match_id: tables.history.match_id }).from(tables.history).all();
  while (!finished) {
    const matchData = await lol.MatchV5.list(constants.riotPuuid, Constants.RegionGroups.AMERICAS, {
      queue: 420,
      count: 100,
      start: index * 100
    });
    console.info(`Start index ${index * 100}`);
    if (matchData.response.length) {
      const newMatches = matchData.response.filter(match_id => !existingMatches.find(em => em.match_id === match_id));
      for (const match of newMatches) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const matchData = await lol.MatchV5.get(match, Constants.RegionGroups.AMERICAS);
        const matchResponse = matchData.response;
        if (matchResponse && matchResponse.info.gameVersion.startsWith("15.")) {
          const participant = matchResponse.info.participants.find(p => p.puuid === constants.riotPuuid);
          console.info(`Inserting match ${matchResponse.metadata.matchId}`);
          await DB.insert(tables.history).values({
            match_id: matchResponse.metadata.matchId,
            puuid: constants.riotPuuid,
            kills: participant?.kills || 0,
            deaths: participant?.deaths || 0,
            assists: participant?.assists || 0,
            is_remake: participant?.gameEndedInEarlySurrender ? 1 : 0,
            result: participant?.win ? 1 : 0,
            champion_id: participant!.championId,
            is_surrender: participant?.gameEndedInSurrender || participant?.gameEndedInEarlySurrender ? 1 : 0,
            date: matchResponse.info.gameStartTimestamp + (matchResponse.info.gameDuration * 1000),
            duration: matchResponse.info.gameDuration * 1000
          });
        }
        else {
          console.info("Finished processing matches");
          finished = true;
        }
      }
    }
    index++;
  }
});
