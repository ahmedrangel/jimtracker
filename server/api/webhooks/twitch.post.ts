export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidTwitchWebhook(event);
  if (!isValidWebhook) throw createError({ statusCode: 401, message: "Unauthorized: webhook is not valid" });
  const headers = getHeaders(event);
  const body = await readBody(event);

  const MESSAGE_TYPE = "Twitch-Eventsub-Message-Type".toLowerCase();
  const MESSAGE_TYPE_VERIFICATION = "webhook_callback_verification";
  if (headers[MESSAGE_TYPE] === MESSAGE_TYPE_VERIFICATION) return body.challenge;

  const handleTwitchWebhook = async () => {
    const { subscription } = body;
    const { type, condition } = subscription;
    if (["stream.online", "stream.offline"].includes(type) && condition?.broadcaster_user_id === constants.twitchId.toString()) {
      const storage = useStorage("cache");
      const info = await storage.getItem<UserInfo>("info");
      if (!info) return;
      const isLive = type === "stream.online";
      const data = { ...info, isLiveTwitch: isLive, updatedAt: Date.now() };
      await storage.setItem<UserInfo>("info", data);
    }
  };

  event.waitUntil(handleTwitchWebhook());
  return true;
});
