export default defineTask({
  meta: {
    name: "riotPolling",
    description: "Poll Riot API for updates"
  },
  run ({ payload, context }) {
    const config = useRuntimeConfig();
    console.info(config.riot.apiKey, config.riot.jimPuuid);
    return { result: { success: true } };
  }
});
