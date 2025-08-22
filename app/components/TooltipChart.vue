<script setup lang="ts">
import { format } from "date-fns";
import { es } from "date-fns/locale";

const props = defineProps<{
  type: "daily" | "match";
  visible: boolean;
  x: number;
  y: number;
  transform: string;
  content: any;
}>();

const style = computed(() => ({
  left: props.x ? `${props.x}px` : "50%",
  top: props.y ? `${props.y}px` : "50%",
  transform: props.transform,
  opacity: props.visible ? 1 : 0,
  transition: "all .3s ease"
}));
</script>

<template>
  <div :style="style" class="text-center text-xs md:text-base absolute bg-slate-900/95 border border-blue-500 rounded-lg w-max overflow-hidden pt-1.5 px-0 pointer-events-none z-100">
    <template v-if="content">
      <template v-if="type === 'daily'">
        <div class="text-base font-bold px-3">{{ content.label }}</div>
        <div class="px-3 flex items-center justify-center font-semibold">
          <img :src="`/images/lol/${content.dayTier?.toLowerCase()}.png`" class="w-10 h-10">
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
        <div class="text-sm px-3 font-semibold bg-neutral-950 py-1">Partidas: {{ content.matches.length }}</div>
        <div v-for="match in content.matches" :key="match.championId + match.time" :class="match.isRemake ? 'bg-neutral-900' : match.win ? 'bg-green-900' : 'bg-red-900'">
          <span class="flex items-center px-3 py-1.5 gap-1.5">
            <img :src="match.championIconUrl" :alt="match.champion" class="w-6 h-6 rounded border border-slate-700" style="object-fit: cover;">
            <span>{{ match.score.kills }}/{{ match.score.deaths }}/{{ match.score.assists }} · {{ timeToAMPM(match.time) }}</span>
          </span>
        </div>
      </template>
      <template v-if="type === 'match'">
        <div class="text-base font-bold px-3">{{ format(content.match.date, "dd MMM yyyy", { locale: es }) }} · {{ timeToAMPM(content.match.time) }}</div>
        <div class="px-3 flex items-center justify-center font-semibold">
          <img :src="`/images/lol/${content.match.tier?.toLowerCase()}.png`" class="w-10 h-10">
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
        <div class="flex items-center justify-center px-3 py-1.5 gap-1.5">
          <img :src="content.match.championIconUrl" :alt="content.match.champion" class="w-12 h-12 rounded border border-slate-700" style="object-fit: cover;">
          <span>{{ content.match.score.kills }}/{{ content.match.score.deaths }}/{{ content.match.score.assists }}</span>
        </div>
      </template>
    </template>
  </div>
</template>
