<script setup lang="ts">
import { format } from "date-fns";
import { es } from "date-fns/locale";

defineProps<{
  type: "daily" | "match";
  content: TooltipContent;
  style?: Record<string, string>;
}>();

const defaultStyle = {
  opacity: 0,
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)"
};
</script>

<template>
  <div :style="style ? style : defaultStyle" class="text-center text-xs md:text-base absolute bg-slate-900/95 border border-blue-500 rounded-lg w-max overflow-hidden pt-1.5 px-0 pointer-events-none z-100 transition-all duration-300 ease-in-out">
    <template v-if="content">
      <template v-if="type === 'daily'">
        <div class="text-base font-bold px-3">{{ content.label }}</div>
        <div class="px-3 flex items-center justify-center font-semibold">
          <img :src="`/images/lol/${content.dataTier?.toLowerCase()}.png`" class="w-10 h-10">
          <span>{{ content.rankDisplay }}</span>
        </div>
        <div class=" px-3 font-semibold mb-1.5">
          <span class="flex items-center gap-1 justify-center">
            <span>
              {{ content.changeText }} LP
            </span>
            <Icon :name="content.changeIcon" :class="content.changeColor" size="26" />
          </span>
        </div>
        <div class="text-sm px-3 font-semibold bg-neutral-950 py-1">Partidas: {{ content.data.length }}</div>
        <div v-for="data in content.data" :key="data.championId + '-' + data.date" :class="data.is_remake ? 'bg-neutral-800' : data.result ? 'bg-green-900' : 'bg-red-900'">
          <span class="flex items-center px-3 py-1.5 gap-1.5">
            <img :src="getChampionIcon(data.champion_id)" :alt="data.champion" class="w-6 h-6 rounded border border-slate-700" style="object-fit: cover;">
            <span>{{ data.kills }}/{{ data.deaths }}/{{ data.assists }} · {{ format(data.date, "h:mm aa") }}</span>
          </span>
        </div>
      </template>
      <template v-if="type === 'match'">
        <div class="text-base font-bold px-3">{{ format(content.data.date, "dd MMM yyyy", { locale: es }) }} · {{ format(content.data.date, "h:mm aa") }}</div>
        <div class="px-3 flex items-center justify-center font-semibold">
          <img :src="`/images/lol/${content.data.tier?.toLowerCase()}.png`" class="w-10 h-10">
          <span>{{ content.rankDisplay }}</span>
        </div>
        <div class=" px-3 font-semibold mb-1.5">
          <span class="flex items-center gap-1 justify-center">
            <span>
              {{ content.changeText }} LP
            </span>
            <Icon :name="content.changeIcon" :class="content.changeColor" size="26" />
          </span>
        </div>
        <div class="flex items-center justify-center px-3 py-1.5 gap-1.5" :class="content.data.is_remake ? 'bg-neutral-800' : content.data.result ? 'bg-green-900' : 'bg-red-900'">
          <img :src="getChampionIcon(content.data.champion_id)" :alt="content.data.champion" class="w-12 h-12 rounded border border-slate-700" style="object-fit: cover;">
          <span>{{ content.data.kills }}/{{ content.data.deaths }}/{{ content.data.assists }}</span>
        </div>
      </template>
    </template>
  </div>
</template>
