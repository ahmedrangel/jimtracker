<script setup lang="ts">
defineProps<{
  user?: UserInfo;
  highest?: RankInfo;
  lowest?: RankInfo;
  mostPlayed?: MostPlayed[];
  champions?: { id: string, name: string }[];
}>();
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
    <div class="flex flex-wrap gap-2 mb-2 justify-center">
      <div class="text-center bg-neutral-950/85 border border-slate-400/40 flex flex-col items-center justify-center px-6 py-3 sm:px-10 sm:py-5 rounded-lg">
        <p class="md:text-xl font-semibold">ELO ACTUAL</p>
        <p class="text-lg md:text-2xl font-bold flex flex-wrap items-center justify-center">
          <img :src="`/images/lol/${user?.tier?.toLowerCase() || 'unranked'}.png`" class="w-12 h-12 md:w-16 md:h-16">
          <span v-if="user">
            {{ user.division }} · {{ user.lp }} LP
          </span>
        </p>
      </div>
      <!-- MOST PLAYED -->
      <div v-if="mostPlayed?.length" class="bg-neutral-950/85 border border-slate-400/40 rounded-lg px-2 py-2 sm:px-6 sm:py-2 text-center">
        <p class="md:text-xl font-semibold mb-2">MÁS JUGADO</p>
        <div class="flex items-center gap-4">
          <div v-for="champ in mostPlayed" :key="champ.champion_id" class="flex flex-col items-center gap-1 ">
            <img :src="getChampionIcon(champ.champion_id)" class="w-12 h-12 mb-1" :alt="String(champ.champion_id)" :title="champions?.find(c => c.id === String(champ.champion_id))!.name">
            <span class="text-sm text-slate-400 font-semibold">
              <span class="text-emerald-300">{{ champ.wins }}</span>V · <span class="text-rose-300">{{ champ.losses }}</span>D (<span class="text-slate-100">{{ champ.count }}</span>)
            </span>
            <span class="text-sm text-slate-100 font-semibold">{{ ((champ.wins / champ.count) * 100).toFixed(2) }}% WR</span>
            <span class="text-xs text-slate-400 font-semibold">
              <span class="text-emerald-300">{{ champ.kills.toFixed(0) }}</span> / <span class="text-rose-300">{{ champ.deaths.toFixed(0) }}</span> / <span class="text-yellow-200">{{ champ.assists.toFixed(0) }}</span> (<span class="text-slate-100">{{ ((champ.kills + champ.assists) / (champ.deaths || 1)).toFixed(2) }}</span> KDA)
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="space-y-4 mb-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="bg-neutral-950/85 border border-emerald-300/40 rounded-lg px-6 py-2 sm:px-10 sm:py-4 text-center flex flex-col items-center justify-center">
          <p class="md:text-lg text-emerald-200 font-semibold mb-1">ELO MÁS ALTO</p>
          <p class="md:text-xl text-emerald-200 font-bold flex flex-wrap items-center justify-center">
            <img :src="`/images/lol/${highest?.tier?.toLowerCase() || 'unranked'}.png`" class="w-12 h-12 md:w-16 md:h-16">
            <span v-if="highest?.tier">{{ highest.division }} · {{ highest.lp }} LP</span>
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <div class="bg-neutral-950/85 border border-purple-300/40 rounded-lg p-2 sm:p-4 text-center flex flex-col items-center justify-center">
            <p class="md:text-lg text-purple-200 font-semibold mb-1">WINRATE</p>
            <p class="md:text-xl text-purple-200 font-bold flex flex-wrap items-center justify-center">
              {{ (user && user.wins && user.losses ? (user.wins / (user.wins + user.losses) * 100).toFixed(2) : "0.00") }}%
            </p>
          </div>
          <div class="flex items-center justify-center gap-2">
            <div class="bg-neutral-950/85 border border-emerald-300/40 rounded-lg p-2 sm:p-4 text-center flex flex-col items-center justify-center w-full">
              <p class="md:text-lg text-emerald-200 font-semibold mb-1">VICTORIAS</p>
              <p class="md:text-xl text-emerald-200 font-bold flex items-center justify-center">
                {{ user?.wins || 0 }}
              </p>
            </div>
            <div class="bg-neutral-950/85 border border-rose-300/40 rounded-lg p-2 sm:p-4 text-center flex flex-col items-center justify-center w-full">
              <p class="md:text-lg text-rose-200 font-semibold mb-1">DERROTAS</p>
              <p class="md:text-xl text-rose-200 font-bold flex items-center justify-center">
                {{ user?.losses || 0 }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-neutral-950/85 border border-rose-300/40 rounded-lg px-6 py-2 sm:px-10 sm:py-4 text-center flex flex-col items-center justify-center">
          <p class="md:text-lg text-rose-200 font-semibold mb-1">ELO MÁS BAJO</p>
          <p class="md:text-xl text-rose-200 font-bold flex flex-wrap items-center justify-center">
            <img :src="`/images/lol/${lowest?.tier?.toLowerCase() || 'unranked'}.png`" class="w-12 h-12 md:w-16 md:h-16">
            <span v-if="lowest?.tier">{{ lowest.division }} · {{ lowest.lp }} LP</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
