export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidKickWebhook(event);
  if (!isValidWebhook) throw createError({ statusCode: 401, message: "Unauthorized: webhook is not valid" });
  const body = await readBody(event);
  const headers = getHeaders(event);
  const kickEventType = headers["kick-event-type"];
  const handleKickWebhook = async () => {
    const { broadcaster, is_live } = body;
    console.info(`Received kick webhook: User ${broadcaster.user_id}, isLive: ${is_live}, eventType: ${kickEventType}`);
    if (broadcaster.user_id === constants.kickId && is_live && kickEventType === "livestream.status.updated") {
      const storage = useStorage("cache");
      const info = await storage.getItem<UserInfo>("info");
      if (!info) return;
      const data = { ...info, isLiveKick: Boolean(is_live), updatedAt: Date.now() };
      await storage.setItem<UserInfo>("info", data);
    }
  };

  event.waitUntil(handleKickWebhook());
  return true;
});
