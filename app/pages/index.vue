<script setup lang="ts">
const { data } = await useFetch<InfoResponse>("/api/info");
const tab = ref("elo");
const isLiveTwitch = data.value?.user?.isLiveTwitch;
const isIngame = data.value?.user?.isIngame;
const twitch = socials.find(s => s.id === "twitch")!;
</script>

<template>
  <main>
    <div class="flex items-center justify-center">
      <div class="rounded aspect-square flex items-center justify-center w-28 h-28 md:w-36 md:h-36">
        <img src="/images/jimrsng.png" class="max-w-full max-h-full object-contain">
      </div>
    </div>
    <div class="flex items-center justify-center my-5 gap-2">
      <NuxtLink :to="twitch.url" target="_blank" external>
        <span class="px-3 py-2 rounded font-bold flex items-center gap-1 shadow-lg" :class="isLiveTwitch ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white animate-pulse' : 'bg-neutral-400 text-black/70'">
          <Icon name="simple-icons:twitch" size="22" />
          <span>{{ isLiveTwitch ? 'En vivo' : 'Offline' }}</span>
        </span>
      </NuxtLink>
      <NuxtLink :to="`https://op.gg/es/lol/summoners/lan/${data?.user?.gameName}-${data?.user?.tagLine}/ingame`" target="_blank" external>
        <span class="px-3 py-2 rounded font-bold flex items-center gap-1 shadow-lg" :class="isIngame ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white animate-pulse' : 'bg-neutral-400 text-black/70'">
          <Icon name="simple-icons:leagueoflegends" size="22" />
          <span>{{ isIngame ? 'En partida' : 'Offline' }}</span>
        </span>
      </NuxtLink>
    </div>
    <UserStats :user="data?.user" :highest="data?.highest" :lowest="data?.lowest" />
    <div class="tabs flex gap-2 justify-end mb-2">
      <button
        class="px-4 py-2 rounded text-white font-semibold border-2"
        :class="tab === 'elo' ? 'bg-neutral-950/90 border-neutral-700/90': 'bg-neutral-800 border-neutral-700/70 hover:bg-neutral-900/90'"
        @click="tab = 'elo'"
      >
        Últimos 30 días
      </button>
      <button
        class="px-4 py-2 rounded text-white font-semibold border-2"
        :class="tab === 'match' ? 'bg-neutral-950/90 border-neutral-800/90': 'bg-neutral-800 border-neutral-700/70 hover:bg-neutral-900/90'"
        @click="tab = 'match'"
      >
        Últimas 100 partidas
      </button>
    </div>
    <div v-show="tab === 'elo'">
      <EloChart :history="data?.history" />
    </div>
    <div v-show="tab === 'match'">
      <MatchChart :matches="data?.recent" />
    </div>
  </main>
</template>
