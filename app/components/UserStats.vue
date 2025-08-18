<script setup lang="ts">
// Datos de ejemplo del usuario
const userStats = ref({
  currentElo: 90,
  highestElo: 20,
  lowestElo: 98,
  gamesPlayed: 147,
  winRate: 64.2,
  winStreak: 3,
  rank: "Oro II"
});

const socials = [
  {
    title: "Twitch",
    icon: "simple-icons:twitch",
    url: "https://www.twitch.tv/jimrsng"
  },
  {
    title: "X",
    icon: "simple-icons:x",
    url: "https://x.com/JimRisingSC"
  },
  {
    title: "Instagram",
    icon: "simple-icons:instagram",
    url: "https://www.instagram.com/Jimrising12"
  },
  {
    title: "TikTok",
    icon: "simple-icons:tiktok",
    url: "https://www.tiktok.com/@jimrising"
  },
  {
    title: "Facebook",
    icon: "simple-icons:facebook",
    url: "https://www.facebook.com/JimRisingSC2"
  },
  {
    title: "YouTube",
    icon: "simple-icons:youtube",
    url: "https://www.youtube.com/channel/UCyLusY-ST8KxpXe1A67r37A"
  }
];
</script>

<template>
  <div class="md:place-items-center">
    <div class="text-center mb-5">
      <div class="flex justify-center gap-1 mb-5">
        <NuxtLink v-for="(social, index) in socials" :key="index" external target="_blank" :to="social.url" class="bg-neutral-950/85 border border-slate-400/40 p-2 rounded hover:bg-neutral-900" :title="social.title">
          <Icon :name="social.icon" size="20" />
        </NuxtLink>
      </div>
      <h2 class="text-2xl font-semibold">EST JimRising <span class="text-slate-400">#LANNN</span></h2>
    </div>
    <div class="mb-5 text-center bg-neutral-950/85 border border-slate-400/40 flex flex-col items-center w-[fit-content] place-self-center px-10 py-5 rounded">
      <p class="md:text-xl font-semibold">ELO ACTUAL</p>
      <p class="text-lg md:text-2xl font-bold flex items-center justify-center">
        <img src="/images/lol/gold.png" class="w-12 h-12 md:w-16 md:h-16">
        II · 12 LP
      </p>
    </div>
    <div class="space-y-4 mb-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="bg-neutral-950/85 border border-emerald-300/40 rounded-lg py-4 px-10 text-center flex flex-col items-center justify-center">
          <p class="md:text-lg text-emerald-200 font-semibold mb-1">ELO MÁXIMO</p>
          <p class="md:text-xl text-emerald-200 font-bold flex items-center justify-center">
            <img src="/images/lol/platinum.png" class="w-12 h-12 md:w-16 md:h-16">
            IV · {{ userStats.highestElo }} LP
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <div class="bg-neutral-950/85 border border-purple-300/40 rounded-lg p-4 text-center flex flex-col items-center justify-center">
            <p class="md:text-lg text-purple-200 font-semibold mb-1">WINRATE</p>
            <p class="md:text-xl text-purple-200 font-bold flex items-center justify-center">
              64.2%
            </p>
          </div>
          <div class="flex items-center justify-center gap-2">
            <div class="bg-neutral-950/85 border border-emerald-300/40 rounded-lg p-4 text-center flex flex-col items-center justify-center w-full">
              <p class="md:text-lg text-emerald-200 font-semibold mb-1">VICTORIAS</p>
              <p class="md:text-xl text-emerald-200 font-bold flex items-center justify-center">
                100
              </p>
            </div>
            <div class="bg-neutral-950/85 border border-rose-300/40 rounded-lg p-4 text-center flex flex-col items-center justify-center w-full">
              <p class="md:text-lg text-rose-200 font-semibold mb-1">DERROTAS</p>
              <p class="md:text-xl text-rose-200 font-bold flex items-center justify-center">
                100
              </p>
            </div>
          </div>
        </div>
        <div class="bg-neutral-950/85 border border-rose-300/40 rounded-lg py-4 px-10 text-center flex flex-col items-center justify-center">
          <p class="md:text-lg text-rose-200 font-semibold mb-1">ELO MÍNIMO</p>
          <p class="md:text-xl text-rose-200 font-bold flex items-center justify-center">
            <img src="/images/lol/silver.png" class="w-12 h-12 md:w-16 md:h-16">
            IV · {{ userStats.lowestElo }} LP
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}
</style>
