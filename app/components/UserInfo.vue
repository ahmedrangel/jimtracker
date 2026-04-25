<script setup lang="ts">
import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";

const props = defineProps<{
  user?: UserInfo;
  showSoloboom?: boolean;
  old?: boolean;
}>();
const isLiveTwitch = computed(() => props?.user?.isLiveTwitch);
const isLiveKick = computed(() => props?.user?.isLiveKick);
const isIngame = computed(() => props?.user?.isIngame);
const gameName = computed(() => props?.user?.gameName);
const tagLine = computed(() => props?.user?.tagLine);
const twitch = socials.find(s => s.id === "twitch")!;
const kick = socials.find(s => s.id === "kick")!;

const latestHaircut = new Date(2026, 0, 7, 0, 0, 0, 0).getTime();

const retosData = [
  {
    reto: "5000 USD si llego a :master: este año",
    castigo: null,
    usuario: "snowbling"
  },
  {
    reto: "1000 USD si llego a :diamond: IV antes del 23 de Mayo",
    castigo: "Jugar SC2 12 horas",
    usuario: "snowbling"
  },
  {
    reto: "600 USD si llego a :diamond: III 50 LP antes del 15 de Junio",
    castigo: "Stream IRL Jimenita",
    usuario: "snuffygoat"
  },
  {
    reto: "100 subs si llego a :emerald: II antes de 100 partidas\nSOLO CON VAYNE, 50 subs si son más de 100 partidas",
    castigo: null,
    usuario: "zasckemb"
  },
  {
    reto: "50 subs si llego a :emerald: antes del 6 de Mayo",
    castigo: "Me pinto el cabello",
    usuario: "Hanamichix"
  }
];

const retosColumns = [
  {
    accessorKey: "reto",
    header: "Reto"
  },
  {
    accessorKey: "castigo",
    header: "Castigo"
  },
  {
    accessorKey: "usuario",
    header: "Usuario"
  }
];

const formatReto = (text: string) => {
  return text.replace(/:([\w]+):/g, (match, name) => {
    return `<img src="/images/lol/${name.toLowerCase()}.png" class="inline-block w-10 h-10" alt="${name}" title="${LEAGUE_TIERS.find(t => t.id.toLowerCase() === name)?.id}" />`;
  });
};
</script>

<template>
  <div class="flex items-center justify-center">
    <div v-if="!showSoloboom" class="rounded aspect-square flex items-center justify-center w-26 h-26 md:w-32 md:h-32">
      <img src="/images/jimrsng.png" class="max-w-full max-h-full object-contain">
    </div>
    <template v-else>
      <div class="rounded aspect-square flex items-center justify-center w-26 h-26 md:w-32 md:h-32">
        <img src="/images/jimrsng.png" class="max-w-full max-h-full object-contain">
      </div>
      <NuxtLink to="https://soloboom.net/leaderboard" external target="_blank">
        <div class="rounded aspect-square flex items-center justify-center w-26 h-26 md:w-32 md:h-32">
          <img src="/images/soloboom2025.webp" class="max-w-full max-h-full object-contain">
        </div>
      </NuxtLink>
    </template>
  </div>
  <div class="flex items-center justify-center my-1 px-3">
    <img src="/images/divider.png" class="h-4 pointer-events-none select-none">
  </div>
  <div class="text-center mb-4">
    <h2 v-if="gameName && tagLine" class="text-2xl font-semibold mb-4">{{ gameName }} <span class="text-slate-400">#{{ tagLine }}</span></h2>
    <div class="flex justify-center gap-1 mb-4">
      <NuxtLink v-for="(social, index) in socials" :key="index" external target="_blank" :to="social.url" class="bg-neutral-950/75 border border-slate-400/40 p-2 rounded hover:bg-neutral-900" :title="social.title">
        <Icon :name="social.icon" size="20" />
      </NuxtLink>
    </div>
  </div>
  <div v-if="!old" class="text-center flex flex-wrap items-center justify-center mt-4 gap-2">
    <NuxtLink :to="twitch.url" target="_blank" external>
      <span class="relative text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1" :class="isLiveTwitch ? 'text-white' : 'text-black/70'">
        <div class="absolute -z-10 inset-0 rounded shadow-lg" :class="isLiveTwitch ? 'bg-linear-to-r from-purple-600 via-purple-500 to-purple-600 animate-pulse shadow-purple-500/50' : 'bg-purple-100/70'" />
        <Icon name="simple-icons:twitch" size="22" />
        <span>{{ isLiveTwitch ? 'En vivo' : 'Offline' }}</span>
      </span>
    </NuxtLink>
    <NuxtLink :to="kick.url" target="_blank" external>
      <span class="relative text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1" :class="isLiveKick ? 'text-white' : 'text-black/70'">
        <div class="absolute -z-10 inset-0 rounded shadow-lg" :class="isLiveKick ? 'bg-linear-to-r from-green-700 via-green-600 to-green-700 animate-pulse shadow-green-500/50' : 'bg-green-100/70'" />
        <Icon name="simple-icons:kick" size="22" />
        <span>{{ isLiveKick ? 'En vivo' : 'Offline' }}</span>
      </span>
    </NuxtLink>
    <NuxtLink :to="`https://op.gg/es/lol/summoners/lan/${user?.gameName}-${user?.tagLine}/ingame`" target="_blank" external :class="{ 'pointer-events-none': !isIngame }">
      <span class="relative text-sm px-3 py-2 rounded font-bold flex items-center justify-center gap-1" :class="isIngame ? 'text-white' : 'text-black/70'">
        <div class="absolute -z-10 inset-0 rounded shadow-lg" :class="isIngame ? 'bg-linear-to-r from-blue-600 via-blue-500 to-blue-600 animate-pulse shadow-blue-500/50' : 'bg-blue-100/70'" />
        <Icon name="simple-icons:leagueoflegends" size="22" />
        <span>{{ isIngame ? 'En partida' : 'Fuera de partida' }}</span>
      </span>
    </NuxtLink>
  </div>
  <div v-if="!old && !showSoloboom" class="flex items-center justify-center pt-4">
    <UPopover :content="{ side: 'top', sideOffset: 0 }" mode="hover" arrow>
      <UButton variant="link" color="neutral" class="p-0 text-default text-md font-normal cursor-help">
        <div class="bg-neutral-950/75 border border-slate-400/40 rounded px-2 py-2 sm:px-4 sm:py-4 text-center flex items-center gap-1">
          <Icon name="ph:scissors" size="20" class="text-purple-200 -rotate-90" />
          <div class="flex gap-1">
            <span>Último corte de pelo:</span>
            <span class="text-purple-200">{{ formatDistanceStrict(latestHaircut, Date.now(), { addSuffix: true, locale: es, unit: "day" }) }}</span>
          </div>
        </div>
      </UButton>
      <template #content>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="formatReto('Si no llego a :master: no me corto el pelo')" />
      </template>
    </UPopover>
  </div>
  <div class="flex items-center justify-center my-4 px-3">
    <img src="/images/divider.png" class="h-4 pointer-events-none select-none">
  </div>
  <UTable
    class="bg-neutral-950/75 border border-slate-400/40 rounded max-w-190 mx-auto **:whitespace-pre-line"
    :data="retosData"
    :columns="retosColumns"
    :ui="{
      th: 'text-center border-x border-default first:border-l-0 last:border-r-0',
      td: 'text-default text-md border-x border-default first:border-l-0 last:border-r-0 py-2',
    }"
  >
    <template #reto-cell="{ row }">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="formatReto(row.original.reto)" />
    </template>
    <template #usuario-cell="{ row }">
      <NuxtLink v-if="row.original.usuario" class="hover:underline" :to="`https://www.twitch.tv/${row.original.usuario}`">{{ row.original.usuario }}</NuxtLink>
    </template>
  </UTable>
  <div class="flex items-center justify-center my-4 px-3">
    <img src="/images/divider.png" class="h-4 pointer-events-none select-none">
  </div>
</template>
