<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
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

function formatTimeToAMPM (time: string) {
  // Espera formato "HH:mm"
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr!, 10);
  const minute = parseInt(minuteStr!, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}
</script>

<template>
  <div :style="style" class="absolute bg-slate-900/95 border border-blue-500 rounded-lg w-max overflow-hidden pt-1.5 px-0 pointer-events-none z-100">
    <template v-if="content">
      <div class="text-base font-bold mb-1.5 px-3">Fecha: {{ content.label }}</div>
      <div class="mb-1 px-3 flex items-center">
        <img :src="`/images/lol/${content.dayTier.toLowerCase()}.png`" class="w-10 h-10">
        <span>{{ content.rankDisplay }}</span>
      </div>
      <div class="mb-1.5 px-3">
        <span class="flex items-center gap-1">
          <span>
            {{ content.changeText }} LP
          </span>
          <Icon :name="content.changeIcon" :class="content.changeColor" size="24" />
        </span>
      </div>
      <div class="mb-1.5 px-3">Partidas: {{ content.matches.length }}</div>
      <div v-for="match in content.matches" :key="match.championId + match.time" :class="match.isRemake ? 'bg-neutral-900' : match.win ? 'bg-green-900' : 'bg-red-900'">
        <span class="flex items-center px-3 py-1.5 gap-1.5">
          <img :src="match.championIconUrl" :alt="match.champion" class="w-6 h-6 rounded border border-slate-700" style="object-fit: cover;">
          <span>{{ match.champion }}: {{ match.score.kills }}/{{ match.score.deaths }}/{{ match.score.assists }} · {{ formatTimeToAMPM(match.time) }}</span>
        </span>
      </div>
    </template>
  </div>
</template>
