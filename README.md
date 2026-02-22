# Jim Rising Tracker

# Secrets
```md
# Riot API Key
NUXT_RIOT_API_KEY=

# Twitch App Credentials
NUXT_TWITCH_CLIENT_ID=
NUXT_TWITCH_CLIENT_SECRET=

# Twitch Webhook Secret Key
NUXT_WEBHOOK_TWITCH_SECRET_KEY=

# Kick App Credentials
NUXT_KICK_CLIENT_ID=
NUXT_KICK_CLIENT_SECRET=

# CDN Token for Blob Storage (Cloudflare R2)
NUXT_CDN_TOKEN=
```

## Screenshot
<img width="1919" height="1350" alt="image" src="https://github.com/user-attachments/assets/b4147b0e-7521-4fc4-831b-56b32cbe8fdd" />

## Tech stack

- **Framework**: [Nuxt 4](https://nuxt.com/), the [Vue](https://vuejs.org/) framework for bringing the best development experience and [NuxtHub](https://hub.nuxt.com/) features.
- **UI Library**: [Nuxt UI](https://ui.nuxt.com/).
- **Deployment**: Serverless hosted on [Cloudflare Workers](https://workers.cloudflare.com/).
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) serverless SQL database.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) TypeScript ORM for SQL databases.
- **Task Scheduling**: [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/).
- **APIs**:
  - [twisted](https://github.com/Sansossio/twisted): Riot Games API wrapper.
- **Webhook Events**:
  - [Twitch Webhook Events](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/).
  - [Kick Webhook Events](https://docs.kick.com/events/event-types).
- **Package Manager**: [pnpm](https://pnpm.io/).

## Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Cloudflare Account](https://cloudflare.com/)
- Riot Games API key from [Riot Developer Portal](https://developer.riotgames.com/)
- Twitch developer app from [Twitch Developer Console](https://dev.twitch.tv/console)
- Kick developer app from [Kick Developer](https://kick.com/settings/developer)

## License

Made with ❤️ by [Ahmed](https://github.com/ahmedrangel) and [Yizack](https://github.com/yizack).

Open Source app and published under [MIT License](https://github.com/JimRsng/comunidad-jimtracker/blob/main/LICENSE).

## Development

<details>
  <summary>Local development</summary>

```sh
# Install dependencies
pnpm install

# Datebase migration
pnpm db:migrate

# Build
pnpm build

# Run ESLint
pnpm lint

# Run typecheck
pnpm test:types
```

</details>

