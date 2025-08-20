export default defineTask({
  meta: {
    name: "riotPolling",
    description: "Poll Riot API for updates"
  },
  run ({ payload, context }) {
    const config = useRuntimeConfig();
    return { result: { success: true } };
  }
});
