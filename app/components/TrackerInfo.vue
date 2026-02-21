<script setup lang="ts">
import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";

const props = defineProps<{
  year?: number;
  soloboom?: boolean;
}>();

const season = props.year ? props.year - 2010 : undefined;

const apiPath = Number(props.year) < new Date().getFullYear() ? SITE.url : "";

const { data } = await useFetch(`${apiPath}/api/info`, {
  query: { season }
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
const isUpdating = ref(false);

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
  isUpdating.value = true;
  const newData = await $fetch("/api/update", { method: "POST" });
  if (newData) data.value = newData;
  now.value = Date.now();
  isUpdating.value = false;
};
</script>

<template>
  <main>
    <UserInfo :user="data?.user" :old="year ? true : false" />
    <UserStats v-if="data" :data="data" :champions="champions" show-countdown :old="year ? true : false" />
    <ClientOnly v-if="!year">
      <div class="flex md:justify-end mb-4">
        <UButton
          class="font-semibold px-3 py-2 rounded flex items-center gap-2 cursor-pointer"
          variant="solid"
          color="neutral"
          :disabled="!canUpdate || isUpdating"
          :loading="isUpdating"
          @click="updateInfo"
        >
          <Icon v-if="!isUpdating" name="ph:arrow-clockwise-bold" size="20" />
          <span v-if="canUpdate">{{ isUpdating ? "Actualizando..." : "Actualizar" }}</span>
          <span v-else>Disponible en <ClientOnly>{{ secondsToAvailable }}s</ClientOnly></span>
        </UButton>
      </div>
    </ClientOnly>
    <ChartHandler :data="data" :champions="champions" />
    <div v-if="data?.user?.updatedAt" class="text-xs my-2 flex flex-col">
      <span class="text-end mb-2">
        Última actualización:
        <ClientOnly>
          <span class="text-yellow-300">{{ formatDistanceStrict(new Date(lastUpdate), now, { addSuffix: true, locale: es }) }}</span>
        </ClientOnly>
      </span>
      <!--
      <div class="flex items-center justify-center gap-1">
        <Icon name="ph:info-bold" size="20" class="text-blue-400" />
        <span class="text-slate-300">Los datos históricos de elo solo considera las partidas registradas a partir del 19 de agosto de 2025, fecha en la que se inició la recopilación de información de las partidas.</span>
      </div>
      -->
    </div>
  </main>
</template>
