import { defineNuxtModule } from "nuxt/kit";
import Git from "simple-git";

export default defineNuxtModule({
  meta: {
    name: "build-info"
  },
  async setup (_options, nuxt) {
    const git = Git();
    nuxt.options.runtimeConfig.public.buildInfo = {
      commit: await git.revparse(["HEAD"]).catch(() => "unknown"),
      shortCommit: await git.revparse(["--short", "HEAD"]).catch(() => "unknown"),
      time: Date.now()
    };
  }
});
