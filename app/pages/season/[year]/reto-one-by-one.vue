<script setup lang="ts">
import type { ChipProps, SelectItem } from "@nuxt/ui";
import challengeData from "~/assets/json/one-by-one-challenge.json";

const categories = computed(() => [
  {
    label: "1 intento",
    headerClass: "text-green-500",
    count: challengeData.filter(c => c.tries === 1).length
  },
  {
    label: "2-5 intentos",
    headerClass: "text-yellow-400",
    count: challengeData.filter(c => c.tries >= 2 && c.tries <= 5).length
  },
  {
    label: "+6 intentos",
    headerClass: "text-red-500",
    count: challengeData.filter(c => c.tries >= 6).length
  }
]);

const championsItems = challengeData.map(c => ({
  label: c.champion,
  value: c.championId.toString()
}));

const triesItems = [
  { label: "1 intento", value: "1", chip: { color: "success" } },
  { label: "2-5 intentos", value: "2-5", chip: { color: "warning" } },
  { label: "+6 intentos", value: "6+", chip: { color: "error" } }
] satisfies SelectItem[];

const filters = ref({
  champion: "",
  tries: ""
});

const filteredData = computed(() => {
  let data = challengeData;

  if (filters.value.champion) {
    data = data.filter(c => c.championId.toString() === filters.value.champion);
  }

  if (filters.value.tries) {
    if (filters.value.tries === "1") {
      data = data.filter(c => c.tries === 1);
    }
    else if (filters.value.tries === "2-5") {
      data = data.filter(c => c.tries >= 2 && c.tries <= 5);
    }
    else if (filters.value.tries === "6+") {
      data = data.filter(c => c.tries >= 6);
    }
  }

  return data;
});

const getBadgeInfo = (tries: number) => {
  if (tries === 1) {
    return { color: "green", text: "intento", textClass: "text-green-500" };
  }
  else if (tries >= 2 && tries <= 5) {
    return { color: "yellow", text: "intentos", textClass: "text-yellow-400" };
  }
  else {
    return { color: "red", text: "intentos", textClass: "text-red-500" };
  }
};

const kdaRatio = ([kills, deaths, assists]: number[]) => {
  return deaths === 0 ? "Perfect" : ((kills! + assists!) / Math.max(1, deaths!)).toFixed(1);
};

const getKdaColor = ([kills, deaths, assists]: number[]) => {
  if (deaths === 0) return "text-orange-500"; // Perfect KDA
  const kda = (kills! + assists!) / Math.max(1, deaths!);
  if (kda > 5) return "text-orange-400";
  if (kda > 4) return "text-blue-400";
  if (kda > 3) return "text-green-400";
  return "text-muted";
};

function getChip (value: string) {
  return triesItems.find(item => item.value === value)?.chip;
}
</script>

<template>
  <div class="space-y-2">
    <div class="space-y-4">
      <h1 class="text-4xl font-bold text-center">Reto One by One</h1>
      <img src="/images/reto-one-by-one.jpg" class="rounded mx-auto border border-slate-400/40 max-w-full" width="600">
      <p class="text-center md:text-balance text-lg">El reto consistía en ganar una partida con cada campeón de League of Legends y en esta sección puedes ver los resultados. El número de intentos representa cuántas partidas tuvo que jugar con cada campeón antes de lograr una victoria.</p>
      <div class="flex flex-col md:flex-row items-center justify-center gap-2">
        <p class="text-sm">
          <strong>Fecha de inicio:</strong> <span class="text-muted">10 de enero de 2026</span>
        </p>
        <span class="hidden md:block">•</span>
        <p class="text-sm">
          <strong>Fecha de finalización:</strong> <span class="text-muted">13 de febrero de 2026</span>
        </p>
        <span class="hidden md:block">•</span>
        <p class="text-sm">
          <strong>Duración:</strong> <span class="text-muted">35 días</span>
        </p>
      </div>
    </div>
    <USeparator
      class="py-4"
      :ui="{ border: 'border-slate-400/40', avatar: 'bg-transparent' }"
      :avatar="{ src: '/images/jimrsng.png', size: 'md' }"
    />
    <div class="flex flex-col md:flex-row justify-center gap-2">
      <div v-for="category in categories" :key="category.label" class="text-center px-12 py-6 bg-neutral-950/75 border border-slate-400/40 rounded">
        <div :class="['text-xl font-bold mb-1', category.headerClass]">
          {{ category.label }}
        </div>
        <div class="text-sm text-gray-400"><strong>{{ category.count }}</strong> Campeones</div>
      </div>
    </div>

    <p class="text-center">Total de <strong>{{ challengeData.length }}</strong> Campeones</p>

    <div class="flex flex-col md:flex-row gap-2">
      <USelectMenu
        v-model="filters.champion"
        class="min-w-full sm:min-w-[30ch]"
        clear
        placeholder="Campeón"
        value-key="value"
        :search-input="{ placeholder: 'Buscar...', icon: 'lucide:search' }"
        :items="championsItems"
        :ui="{ placeholder: 'ms-1', value: 'ms-1', base: 'bg-neutral-950/75' }"
      >
        <template #empty>
          Sin resultados
        </template>
        <template #leading>
          <img v-if="filters.champion" :src="getChampionIcon(Number(filters.champion))" :alt="filters.champion" class="size-6 rounded-sm">
          <img v-else src="https://cdn.communitydragon.org/latest/profile-icon/29" alt="Seleccionar campeón" class="size-6 rounded-sm">
        </template>
        <template #item-leading="{ item }">
          <img :src="getChampionIcon(Number(item.value))" :alt="item.value" class="size-6 rounded-sm me-1">
        </template>
      </USelectMenu>

      <USelectMenu
        v-model="filters.tries"
        class="min-w-full sm:min-w-[30ch]"
        clear
        placeholder="Filtrar por intentos"
        value-key="value"
        :items="triesItems"
        :ui="{ placeholder: 'ms-1', value: 'ms-1', base: 'bg-neutral-950/75', input: 'hidden' }"
      >
        <template #leading="{ modelValue, ui }">
          <UChip
            v-bind="getChip(modelValue!) || { color: 'neutral' }"
            inset
            standalone
            :size="(ui.itemLeadingChipSize() as ChipProps['size'])"
            :class="ui.itemLeadingChip()"
          />
        </template>
      </USelectMenu>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <TransitionGroup name="list">
        <div v-for="champ in filteredData" :key="champ.championId" class="list-items flex items-center gap-6 bg-neutral-950/75 border border-slate-400/40 rounded">
          <img :src="getChampionIcon(champ.championId)" :alt="champ.champion" class="size-16 rounded border-2 border-slate-400/40 ml-4">
          <div class="flex flex-col flex-1">
            <div class="font-semibold text-muted text-sm">{{ champ.champion }}</div>
            <div class="text-xl font-bold">{{ champ.kda[0] }}/{{ champ.kda[1] }}/{{ champ.kda[2] }}</div>
            <UPopover mode="hover">
              <UButton variant="link" class="p-0">
                <div :class="['text-xs font-bold cursor-help', getKdaColor(champ.kda)]">{{ kdaRatio(champ.kda) }} KDA</div>
              </UButton>
              <template #content>
                <div class="text-sm p-2">
                  (K {{ champ.kda[0] }} + A {{ champ.kda[2] }}) / D {{ champ.kda[1] }}
                </div>
              </template>
            </UPopover>
          </div>
          <div class="flex flex-col items-center border-l border-slate-400/40 py-6 px-6">
            <UPopover mode="hover">
              <UButton variant="link" class="p-0">
                <span :class="['text-2xl font-bold cursor-help', getBadgeInfo(champ.tries).textClass]">
                  {{ champ.tries }}
                </span>
              </UButton>
              <template #content>
                <div class="text-sm p-2">
                  Completado en <NuxtTime :datetime="champ.date" day="numeric" month="long" year="numeric" locale="es" time-zone="UTC" />
                </div>
              </template>
            </UPopover>
            <span class="text-xs text-gray-400">{{ getBadgeInfo(champ.tries).text }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
