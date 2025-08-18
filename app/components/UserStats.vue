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

const eloTrend = computed(() => {
  // Simular tendencia basada en datos recientes
  const trend = Math.random() > 0.5 ? "up" : "down";
  const change = Math.floor(Math.random() * 50) + 5;
  return { trend, change };
});

const getRankColor = (rank: string) => {
  const rankColors: { [key: string]: string } = {
    Bronce: "text-amber-600",
    Plata: "text-gray-500",
    Oro: "text-yellow-500",
    Platino: "text-cyan-500",
    Diamante: "text-blue-500",
    Maestro: "text-purple-500"
  };

  const baseRank = rank.split(" ")[0];
  return rankColors[baseRank] || "text-gray-600";
};
</script>

<template>
  <div>
    <div class="text-center mb-5">
      <div class="flex justify-center gap-4 mb-5">
        <NuxtLink external target="_blank" to="https://www.twitch.tv/jimrsng">
          <Icon name="simple-icons:twitch" class="text-purple-400" size="20" />
        </NuxtLink>
        <NuxtLink external target="_blank" to="https://x.com/JimRisingSC">
          <Icon name="simple-icons:x" class="text-white-500" size="20" />
        </NuxtLink>
        <NuxtLink external target="_blank" to="https://www.instagram.com/Jimrising12">
          <Icon name="simple-icons:instagram" class="text-pink-400" size="20" />
        </NuxtLink>
        <NuxtLink external target="_blank" to="https://www.tiktok.com/@jimrising">
          <Icon name="simple-icons:tiktok" class="text-white-500" size="20" />
        </NuxtLink>
        <NuxtLink external target="_blank" to="https://www.facebook.com/JimRisingSC2">
          <Icon name="simple-icons:facebook" class="text-blue-400" size="20" />
        </NuxtLink>
        <NuxtLink external target="_blank" to="https://www.youtube.com/channel/UCyLusY-ST8KxpXe1A67r37A">
          <Icon name="simple-icons:youtube" class="text-rose-400" size="20" />
        </NuxtLink>
      </div>
      <h2 class="text-2xl font-semibold">EST JimRising <span class="text-slate-400">#LANNN</span></h2>
    </div>
    <div class="mb-5 text-center bg-slate-950/70 border border-yellow-700/50 flex flex-col items-center w-[fit-content] place-self-center px-10 py-4 rounded">
      <p class="text-xl font-semibold">Elo Actual</p>
      <p class="text-xl font-bold flex items-center justify-center">
        <img src="/images/lol/gold.png" class="w-16 h-16">
        II · 12 LP
      </p>
    </div>
    <div class="space-y-4 mb-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="bg-emerald-50 rounded-lg py-4 px-10 text-center flex flex-col items-center justify-center">
          <p class="text-sm text-emerald-900 font-semibold mb-1">Elo Máximo</p>
          <p class="text-xl font-bold text-emerald-900 flex items-center justify-center">
            <img src="/images/lol/platinum.png" class="w-16 h-16">
            IV · {{ userStats.highestElo }} LP
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <div class="bg-purple-50 rounded-lg p-4 text-center flex flex-col items-center justify-center">
            <p class="text-sm text-purple-900 font-semibold mb-1">Winrate</p>
            <p class="text-xl font-bold text-purple-900 flex items-center justify-center">
              64.2%
            </p>
          </div>
          <div class="flex items-center justify-center gap-2">
            <div class="bg-emerald-50 rounded-lg p-4 text-center flex flex-col items-center justify-center w-full">
              <p class="text-sm text-emerald-900 font-semibold mb-1">Victorias</p>
              <p class="text-xl font-bold text-emerald-900 flex items-center justify-center">
                100
              </p>
            </div>
            <div class="bg-rose-50 rounded-lg p-4 text-center flex flex-col items-center justify-center w-full">
              <p class="text-sm text-rose-900 font-semibold mb-1">Derrotas</p>
              <p class="text-xl font-bold text-rose-900 flex items-center justify-center">
                100
              </p>
            </div>
          </div>
        </div>
        <div class="bg-rose-50 rounded-lg py-4 px-10 text-center flex flex-col items-center justify-center">
          <p class="text-sm text-rose-900 font-semibold mb-1">Elo Mínimo</p>
          <p class="text-xl font-bold text-rose-900 flex items-center justify-center">
            <img src="/images/lol/silver.png" class="w-16 h-16">
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
