<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";

const { params } = useRoute("season-year");

const season = params.year ? Number(params.year) - 2010 : undefined;

const apiPath = Number(params.year) < new Date().getFullYear() ? SITE.url : "";

const { data } = await useFetch(`${apiPath}/api/info`, {
  query: { season, soloboom: true }
});
const { data: champions } = await useFetch(`${apiPath}/api/champions`);

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
    { rel: "canonical", href: `${SITE.url}/season/${params.year}/soloboom` }
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
  const newData = await $fetch("/api/update", { method: "POST", query: { soloboom: true } });
  if (newData) data.value = newData;
  now.value = Date.now();
};

const old = computed(() => {
  const currentYear = new Date().getFullYear();
  return currentYear > Number(params.year);
});
</script>

<template>
  <main>
    <UserInfo :user="data?.user" show-soloboom :old="true" />
    <UserStats v-if="data" :data="data" :champions="champions" :show-soloboom-rank="old ? false : true" :old="old" />
    <!-- Botón de Actualizar -->
    <ClientOnly v-if="!old">
      <div class="flex md:justify-end mb-4">
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!canUpdate"
          @click="updateInfo"
        >
          <Icon name="ph:arrow-clockwise-bold" size="20" />
          <span v-if="canUpdate">Actualizar</span>
          <span v-else>Disponible en: {{ secondsToAvailable }}s</span>
        </button>
      </div>
    </ClientOnly>
    <ChartHandlerSoloBoom :data="data" :champions="champions" />
    <div v-if="data?.user?.updatedAt && !old" class="text-xs my-2 flex flex-col">
      <span class="text-end mb-2">
        Última actualización:
        <ClientOnly>
          <span class="text-yellow-300">{{ formatDistanceStrict(new Date(lastUpdate), now, { addSuffix: true, locale: es }) }}</span>
        </ClientOnly>
      </span>
    </div>
  </main>
</template>
