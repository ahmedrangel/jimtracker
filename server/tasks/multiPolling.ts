import { polling } from "../utils/polling";

export default defineTask({
  meta: {
    name: "multiPolling",
    description: "Poll Riot API for updates"
  },
  async run (): Promise<{
    result?: (UserInfo | null)[];
  }> {
    const multiPolling = await Promise.all([
      polling(constants.riotPuuid, "info"),
      polling(constants.soloboomPuuids[2025], "info-soloboom")
    ]);
    return { result: multiPolling.map(item => item.result) };
  }
});
