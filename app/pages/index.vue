<script setup lang="ts">
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";

const { data } = await useFetch<InfoResponse>("/api/info");
const { data: champions } = await useFetch("/api/champions");

const tab = ref("elo");
const isLiveTwitch = data.value?.user?.isLiveTwitch;
const isLiveKick = data.value?.user?.isLiveKick;
const isIngame = data.value?.user?.isIngame;
const twitch = socials.find(s => s.id === "twitch")!;
const kick = socials.find(s => s.id === "kick")!;

watch(tab, () => {
  localStorage.setItem("preferred-tab", tab.value);
});

onMounted(() => {
  const savedTab = localStorage.getItem("preferred-tab") || "elo";
  if (savedTab === "match" || savedTab === "elo") tab.value = savedTab;
});

useSeoMeta({
  title: SITE.title,
  ogTitle: SITE.title,
  description: SITE.description,
  ogDescription: SITE.description,
  ogImage: `${SITE.url}/images/og-image.png`,
  twitterImage: `${SITE.url}/images/og-image.png`,
  twitterCard: "summary_large_image",
  twitterTitle: SITE.title,
  twitterDescription: SITE.description
});

useHead({
  link: [
    { rel: "canonical", href: SITE.url }
  ],
  script: [{
    type: "application/ld+json",
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE.name,
      "url": SITE.url
    })
  }]
});
</script>

<template>
  <main>
    <div class="flex items-center justify-center">
      <div class="rounded aspect-square flex items-center justify-center w-26 h-26 md:w-32 md:h-32">
        <img src="/images/jimrsng.png" class="max-w-full max-h-full object-contain">
      </div>
    </div>
    <div class="text-center flex flex-wrap items-center justify-center my-5 gap-2">
      <NuxtLink :to="twitch.url" target="_blank" external>
        <span class="text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1 shadow-lg" :class="isLiveTwitch ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white animate-pulse' : 'bg-purple-100/70 text-black/70'">
          <Icon name="simple-icons:twitch" size="22" />
          <span>{{ isLiveTwitch ? 'En vivo' : 'Offline' }}</span>
        </span>
      </NuxtLink>
      <NuxtLink :to="kick.url" target="_blank" external>
        <span class="text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1 shadow-lg" :class="isLiveKick ? 'bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white animate-pulse' : 'bg-green-100/70 text-black/70'">
          <Icon name="simple-icons:kick" size="22" />
          <span>{{ isLiveKick ? 'En vivo' : 'Offline' }}</span>
        </span>
      </NuxtLink>
      <NuxtLink :to="`https://op.gg/es/lol/summoners/lan/${data?.user?.gameName}-${data?.user?.tagLine}/ingame`" target="_blank" external :class="{ 'pointer-events-none': !isIngame }">
        <span class="text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1 shadow-lg" :class="isIngame ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white animate-pulse' : 'bg-blue-100/70 text-black/70'">
          <Icon name="simple-icons:leagueoflegends" size="22" />
          <span>{{ isIngame ? 'En partida' : 'Fuera de partida' }}</span>
        </span>
      </NuxtLink>
    </div>
    <UserStats :user="data?.user" :highest="data?.highest" :lowest="data?.lowest" :champions="champions" :most-played="data?.mostPlayed" />
    <div class="tabs flex gap-2 justify-center sm:justify-end mb-2">
      <button
        class="px-4 py-2 rounded text-white font-semibold border-2"
        :class="tab === 'match' ? 'bg-neutral-950/90 border-neutral-800/90': 'bg-neutral-800 border-neutral-700/70 hover:bg-neutral-900/90'"
        @click="tab = 'match'"
      >
        Últimas 100 partidas
      </button>
      <button
        class="px-4 py-2 rounded text-white font-semibold border-2"
        :class="tab === 'elo' ? 'bg-neutral-950/90 border-neutral-700/90': 'bg-neutral-800 border-neutral-700/70 hover:bg-neutral-900/90'"
        @click="tab = 'elo'"
      >
        Últimos 30 días
      </button>
    </div>
    <EloChart :history="tab === 'elo' ? data?.history : data?.recent" :champions="champions" :type="tab === 'elo' ? 'daily' : 'match'" />
    <div v-if="data?.user?.updatedAt" class="text-xs my-5 flex flex-col">
      <span class="text-end mb-5">Última actualización: <span class="text-yellow-300">{{ formatDistanceToNowStrict(new Date(data?.user?.updatedAt), { addSuffix: true, locale: es }) }}</span></span>
      <div class="flex items-center justify-center gap-1">
        <Icon name="ph:info-bold" size="20" class="text-blue-400" />
        <span class="text-slate-300">Los datos históricos de elo solo considera las partidas registradas a partir del 19 de agosto de 2025, fecha en la que se inició la recopilación de información de las partidas.</span>
      </div>
    </div>
    <div class="text-center text-sm text-slate-300">
      <span>Creado por <NuxtLink href="https://github.com/ahmedrangel" target="_blank" external class="text-emerald-300 font-semibold hover:underline">Ahmed Rangel</NuxtLink> con ❤️</span>
    </div>
  </main>
</template>
