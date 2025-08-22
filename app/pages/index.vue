<script setup lang="ts">
import { ref } from "vue";

const { data } = await useFetch<InfoResponse>("/api/info");

const tab = ref("elo");
</script>

<template>
  <main>
    <div class="flex items-center justify-center">
      <div class="mb-5 p-4 bg-slate-900 border border-slate-800 rounded aspect-square flex items-center justify-center w-30 h-30 md:w-36 md:h-36">
        <img src="/images/jimrsng.png" class="max-w-full max-h-full object-contain">
      </div>
    </div>
    <UserStats :user="data?.user" :highest="data?.highest" :lowest="data?.lowest" />
    <div class="tabs flex gap-2 justify-end mb-2">
      <button
        class="px-4 py-2 rounded text-white font-semibold border-2"
        :class="tab === 'elo' ? 'bg-neutral-950/90 border-neutral-700/90': 'bg-neutral-800 border-neutral-700/70 hover:bg-neutral-900/90'"
        @click="tab = 'elo'"
      >
        Últimos 30 días
      </button>
      <button
        class="px-4 py-2 rounded text-white font-semibold border-2"
        :class="tab === 'match' ? 'bg-neutral-950/90 border-neutral-800/90': 'bg-neutral-800 border-neutral-700/70 hover:bg-neutral-900/90'"
        @click="tab = 'match'"
      >
        Últimas 100 partidas
      </button>
    </div>
    <div v-show="tab === 'elo'">
      <EloChart :history="data?.history" />
    </div>
    <div v-show="tab === 'match'">
      <MatchChart :matches="data?.recent" />
    </div>
  </main>
</template>
