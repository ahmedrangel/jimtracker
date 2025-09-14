<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";

const { data } = await useFetch("/api/info");
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

const updateCooldown = 120; // segundos
const now = ref(Date.now());
let intervalId: number | undefined;

const lastUpdate = computed(() => data.value?.user?.updatedAt ? new Date(data.value.user.updatedAt).getTime() : 0);
const secondsSinceUpdate = computed(() => Math.floor((now.value - lastUpdate.value) / 1000));
const canUpdate = computed(() => secondsSinceUpdate.value >= updateCooldown);
const secondsToAvailable = computed(() => Math.max(0, updateCooldown - secondsSinceUpdate.value));

onMounted(() => {
  intervalId = window.setInterval(() => {
    now.value = Date.now();
  }, 500);
});
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const updateInfo = async () => {
  if (!canUpdate.value) return;
  const newData = await $fetch("/api/update", { method: "POST" });
  if (newData) data.value = newData;
  now.value = Date.now();
};
</script>

<template>
  <main>
    <div class="flex items-center justify-center mb-4">
      <div class="rounded aspect-square flex items-center justify-center w-26 h-26 md:w-32 md:h-32">
        <img src="/images/jimrsng.png" class="max-w-full max-h-full object-contain">
      </div>
    </div>
    <div class="text-center mb-4">
      <h2 class="text-2xl font-semibold mb-4">EST JimRising <span class="text-slate-400">#LANNN</span></h2>
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
      <NuxtLink :to="`https://op.gg/es/lol/summoners/lan/${data?.user?.gameName}-${data?.user?.tagLine}/ingame`" target="_blank" external :class="{ 'pointer-events-none': !isIngame }">
        <span class="relative text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1" :class="isIngame ? 'text-white' : 'text-black/70'">
          <div class="absolute -z-10 inset-0 rounded shadow-lg" :class="isIngame ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 animate-pulse shadow-blue-500/50' : 'bg-blue-100/70'" />
          <Icon name="simple-icons:leagueoflegends" size="22" />
          <span>{{ isIngame ? 'En partida' : 'Fuera de partida' }}</span>
        </span>
      </NuxtLink>
    </div>
    <UserStats :user="data?.user" :highest="data?.highest" :lowest="data?.lowest" :champions="champions" :most-played="data?.mostPlayed" :history="data?.recent" />
    <!-- Botón de actualizar -->
    <div class="flex md:justify-end mb-4">
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="!canUpdate"
        @click="updateInfo"
      >
        <Icon name="ph:arrow-clockwise-bold" size="20" />
        <span v-if="canUpdate">Actualizar</span>
        <span v-else>Disponible en: <ClientOnly>{{ secondsToAvailable }}s</ClientOnly></span>
      </button>
    </div>
    <div class="tabs flex gap-2 justify-center sm:justify-end mb-2">
      <button
        class="px-4 py-2 rounded text-white font-semibold border-2"
        :class="tab === 'match' ? 'bg-neutral-950/90 border-neutral-800/90': 'bg-neutral-800 border-neutral-700/70 hover:bg-neutral-900/90'"
        @click="tab = 'match'"
      >
        Últimas 200 partidas
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
    <div v-if="data?.user?.updatedAt" class="text-xs my-2 flex flex-col">
      <span class="text-end mb-2">Última actualización: <span class="text-yellow-300">{{ formatDistanceToNowStrict(new Date(data?.user?.updatedAt), { addSuffix: true, locale: es }) }}</span></span>
      <div class="flex items-center justify-center gap-1">
        <Icon name="ph:info-bold" size="20" class="text-blue-400" />
        <span class="text-slate-300">Los datos históricos de elo solo considera las partidas registradas a partir del 19 de agosto de 2025, fecha en la que se inició la recopilación de información de las partidas.</span>
      </div>
    </div>
  </main>
</template>
