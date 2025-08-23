import { SITE } from "../shared/utils/site";

export default defineNuxtConfig({
  compatibilityDate: "2025-08-19",
  // future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: SITE.title,
      htmlAttrs: {
        lang: "es"
      },
      link: [],
      meta: [
        { name: "robots", content: "index, follow" }
      ]
    }
  },

  css: [
    "~/assets/css/main.css",
    "~/assets/scss/app.scss"
  ],

  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/sitemap",
    "@nuxthub/core"
  ],

  icon: {
    mode: "svg",
    clientBundle: { scan: true, sizeLimitKb: 2048 }
  },

  eslint: {
    config: {
      autoInit: false,
      stylistic: true
    }
  },

  runtimeConfig: {
    riot: {
      apiKey: ""
    },
    twitch: {
      clientId: "",
      clientSecret: ""
    },
    kick: {
      clientId: "",
      clientSecret: ""
    }
  },

  colorMode: {
    preference: "dark",
    fallback: "dark"
  },

  site: { url: SITE.url },

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      crawlLinks: false,
      routes: ["/sitemap.xml"]
    },
    cloudflare: {
      pages: {
        routes: {
          exclude: ["/images/*"]
        }
      }
    },
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      "*/10 * * * *": ["riotPolling"]
    }
  },

  sitemap: {
    discoverImages: false,
    urls: [
      { loc: "/", priority: 1 }
    ],
    defaults: { priority: 0.8, lastmod: new Date().toISOString() },
    xslColumns: [
      { label: "URL", width: "65%" },
      { label: "Priority", select: "sitemap:priority", width: "12.5%" },
      { label: "Last Modified", select: "sitemap:lastmod", width: "35%" }
    ]
  },

  routeRules: {
    "/api/_nuxt_icon/**": { cache: { maxAge: 1.577e+7 } }
  },

  features: {
    inlineStyles: false
  },

  experimental: {
    typedPages: true
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["mixed-decls", "color-functions", "import", "global-builtin"]
        }
      }
    }
  },

  hub: {
    cache: true,
    workers: true,
    database: true
  }
});
