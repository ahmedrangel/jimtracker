import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { env, loadEnvFile } from "node:process";
import { constants } from "../../server/utils/constants.ts";
import { SITE } from "../../shared/utils/site.ts";

loadEnvFile();

if (!env.NUXT_TWITCH_CLIENT_ID || !env.NUXT_TWITCH_CLIENT_SECRET || !env.NUXT_WEBHOOK_TWITCH_SECRET_KEY) {
  throw new Error("Missing TWITCH API credentials");
}

const condition = { broadcaster_user_id: constants.twitchId.toString() };
const transport: { method: "webhook", callback: string, secret: string } = {
  method: "webhook",
  callback: `${SITE.url}/api/webhooks/twitch`,
  secret: env.NUXT_WEBHOOK_TWITCH_SECRET_KEY
};

const authProvider = new AppTokenAuthProvider(env.NUXT_TWITCH_CLIENT_ID, env.NUXT_TWITCH_CLIENT_SECRET);
const client = new ApiClient({ authProvider });

const [online, offline] = await Promise.all([
  client.eventSub.createSubscription("stream.online", "1", condition, transport).catch(() => null),
  client.eventSub.createSubscription("stream.offline", "1", condition, transport).catch(() => null)
]);

console.info(online, offline);

const subscriptions = await client.eventSub.getSubscriptions();

for (const sub of subscriptions.data) {
  console.info(sub.id, sub.type, sub.status);
  if (sub.status === "webhook_callback_verification_failed") {
    await client.eventSub.deleteSubscription(sub.id);
  }
}
