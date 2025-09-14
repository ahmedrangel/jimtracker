<script setup lang="ts">
defineProps<{
  data?: InfoResponse;
  champions?: { id: string, name: string }[];
}>();
const tab = ref("elo");

watch(tab, () => {
  localStorage.setItem("preferred-tab", tab.value);
});

onMounted(() => {
  const savedTab = localStorage.getItem("preferred-tab") || "elo";
  if (savedTab === "match" || savedTab === "elo") tab.value = savedTab;
});
</script>

<template>
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
</template>
