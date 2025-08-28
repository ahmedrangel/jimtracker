// Subscribe to Webhook Events
import { Kient, KientAppTokenAuthentication } from "kient";
import { env, loadEnvFile } from "node:process";
import { constants } from "../../server/utils/constants.ts";

loadEnvFile();

if (!env.NUXT_KICK_CLIENT_ID || !env.NUXT_KICK_CLIENT_SECRET) {
  throw new Error("Missing KICK API credentials");
}

const events = [
  { name: "livestream.status.updated", version: 1 }
];

const kient = new Kient();
const auth = new KientAppTokenAuthentication({
  clientId: env.NUXT_KICK_CLIENT_ID,
  clientSecret: env.NUXT_KICK_CLIENT_SECRET
});

const token = await auth.generateToken();
kient.setAuthToken(token.accessToken);

const response = await kient.api.event.subscribe({
  method: "webhook",
  broadcaster_user_id: constants.kickId,
  events
});

console.info(response);
