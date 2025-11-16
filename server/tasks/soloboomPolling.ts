import { polling } from "../utils/polling";

export default defineTask({
  meta: {
    name: "soloboomPolling",
    description: "Poll Riot API for updates"
  },
  async run (): Promise<{
    result: UserInfo | null;
  }> {
    return polling(constants.soloboomPuuids[2025], "info-soloboom");
  }
});
