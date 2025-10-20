<script setup lang="ts">
const props = defineProps<{
  user?: UserInfo;
}>();
const isLiveTwitch = computed(() => props?.user?.isLiveTwitch);
const isLiveKick = computed(() => props?.user?.isLiveKick);
const isIngame = computed(() => props?.user?.isIngame);
const gameName = computed(() => props?.user?.gameName);
const tagLine = computed(() => props?.user?.tagLine);
const twitch = socials.find(s => s.id === "twitch")!;
const kick = socials.find(s => s.id === "kick")!;
</script>

<template>
  <div class="flex items-center justify-center mb-4">
    <div class="rounded aspect-square flex items-center justify-center w-26 h-26 md:w-32 md:h-32">
      <img src="/images/jimrsng.png" class="max-w-full max-h-full object-contain">
    </div>
  </div>
  <div class="text-center mb-4">
    <h2 v-if="gameName && tagLine" class="text-2xl font-semibold mb-4">{{ gameName }} <span class="text-slate-400">#{{ tagLine }}</span></h2>
    <div class="flex justify-center gap-1 mb-4">
      <NuxtLink v-for="(social, index) in socials" :key="index" external target="_blank" :to="social.url" class="bg-neutral-950/75 border border-slate-400/40 p-2 rounded hover:bg-neutral-900" :title="social.title">
        <Icon :name="social.icon" size="20" />
      </NuxtLink>
    </div>
  </div>
  <div class="text-center flex flex-wrap items-center justify-center my-5 gap-2">
    <NuxtLink :to="twitch.url" target="_blank" external>
      <span class="relative text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1" :class="isLiveTwitch ? 'text-white' : 'text-black/70'">
        <div class="absolute -z-10 inset-0 rounded shadow-lg" :class="isLiveTwitch ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 animate-pulse shadow-purple-500/50' : 'bg-purple-100/70'" />
        <Icon name="simple-icons:twitch" size="22" />
        <span>{{ isLiveTwitch ? 'En vivo' : 'Offline' }}</span>
      </span>
    </NuxtLink>
    <NuxtLink :to="kick.url" target="_blank" external>
      <span class="relative text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1" :class="isLiveKick ? 'text-white' : 'text-black/70'">
        <div class="absolute -z-10 inset-0 rounded shadow-lg" :class="isLiveKick ? 'bg-gradient-to-r from-green-700 via-green-600 to-green-700 animate-pulse shadow-green-500/50' : 'bg-green-100/70'" />
        <Icon name="simple-icons:kick" size="22" />
        <span>{{ isLiveKick ? 'En vivo' : 'Offline' }}</span>
      </span>
    </NuxtLink>
    <NuxtLink :to="`https://op.gg/es/lol/summoners/lan/${user?.gameName}-${user?.tagLine}/ingame`" target="_blank" external :class="{ 'pointer-events-none': !isIngame }">
      <span class="relative text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1" :class="isIngame ? 'text-white' : 'text-black/70'">
        <div class="absolute -z-10 inset-0 rounded shadow-lg" :class="isIngame ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 animate-pulse shadow-blue-500/50' : 'bg-blue-100/70'" />
        <Icon name="simple-icons:leagueoflegends" size="22" />
        <span>{{ isIngame ? 'En partida' : 'Fuera de partida' }}</span>
      </span>
    </NuxtLink>
  </div>
</template>
