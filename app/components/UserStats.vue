<script setup lang="ts">
const props = defineProps<{
  user?: UserInfo;
  highest?: RankInfo;
  lowest?: RankInfo;
  mostPlayed?: MostPlayed[];
  champions?: { id: string, name: string }[];
  history?: HistoryData[];
  showCountdown?: boolean;
  showSoloboomRank?: boolean;
}>();
const streak = computed(() => {
  const history = props.history?.filter(h => !h.is_remake)?.toSorted((a, b) => b.date - a.date) || [];
  if (!props.history || props.history.length === 0) return 0;
  let count = 0;
  const lastResult = history[0]?.result;
  for (let i = 0; i < history.length; i++) {
    if (history[i]?.result === lastResult) {
      count++;
    }
    else {
      break;
    }
  }
  return lastResult ? count : -count;
});

const endOfSeasonDate = "2026-01-07T23:59:59-06:00";
const endOfSeasonTimestamp = new Date(endOfSeasonDate).getTime();

const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});
let intervalId: number | undefined;

const updateCountdown = () => {
  const now = Date.now();
  let diff = endOfSeasonTimestamp - now;
  if (diff < 0) diff = 0;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  countdown.value = { days, hours, minutes, seconds };
};

const { data: soloBoomData, pending: loadingSoloboom, refresh } = useLazyFetch("/api/soloboom", {
  default: () => (null),
  immediate: false
});

onMounted(() => {
  if (props.showCountdown) {
    updateCountdown();
    intervalId = window.setInterval(updateCountdown, 500);
  }
  if (props.showSoloboomRank) {
    refresh();
  }
});
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="md:place-items-center">
    <div class="space-y-4 mb-5">
      <div class="grid grid-cols-2 gap-2 md:gap-4">
        <!-- COUNTDOWN FIN DE TEMPORADA -->
        <div v-if="showCountdown" class="bg-neutral-950/75 border border-slate-400/40 rounded px-2 py-2 sm:px-4 sm:py-4 text-center flex flex-col items-center justify-center col-span-2 md:col-span-1 md:min-w-[230px]">
          <p class="md:text-xl text-emerald-100 font-semibold">FIN DE TEMPORADA</p>
          <p class="text-lg md:text-2xl text-green-300/50 font-bold flex flex-wrap items-center justify-center">
            <span v-if="countdown">
              <span class="text-emerald-200">{{ countdown.days }}</span>d
              <span class="text-emerald-200">{{ countdown.hours }}</span>h
              <span class="text-emerald-200">{{ countdown.minutes }}</span>m
              <span class="text-emerald-200">{{ countdown.seconds }}</span>s
            </span>
          </p>
        </div>
        <!-- SOLOBOOM RANK -->
        <div v-if="showSoloboomRank" class="bg-neutral-950/75 border border-slate-400/40 rounded px-2 py-2 sm:px-4 sm:py-4 text-center flex flex-col items-center justify-center col-span-2 md:col-span-1">
          <p class="md:text-xl text-emerald-100 font-semibold">SOLOBOOM RANK</p>
          <p class="text-lg md:text-2xl text-green-300/50 font-bold flex flex-wrap items-center justify-center">
            <span v-if="loadingSoloboom" class="text-emerald-200 mt-2"><Icon name="eos-icons:loading" /></span>
            <span v-else class="text-emerald-200">{{ soloBoomData?.rank || "N/A" }}</span>
          </p>
        </div>
        <!-- ELO ACTUAL -->
        <div class="text-center bg-neutral-950/75 border border-slate-400/40 flex flex-col items-center justify-center px-2 py-2 sm:px-4 sm:py-4 rounded">
          <p class="md:text-xl font-semibold">ELO ACTUAL</p>
          <p class="text-lg md:text-2xl font-bold flex flex-wrap items-center justify-center">
            <img :src="`/images/lol/${user?.tier?.toLowerCase() || 'unranked'}.png`" class="w-12 h-12 md:w-16 md:h-16">
            <span v-if="user && user.tier">
              {{ user.division }} · {{ user.lp }} LP
            </span>
          </p>
        </div>
        <!-- RACHA -->
        <div class="bg-neutral-950/75 border border-slate-400/40 rounded px-2 py-2 sm:px-4 sm:py-4 text-center flex flex-col items-center justify-center">
          <p class="md:text-xl font-semibold">RACHA</p>
          <p class="text-lg md:text-2xl font-bold flex flex-wrap items-center justify-center">
            <span :class="streak < 0 ? 'text-rose-400' : 'text-green-400'">{{ streak < 0 ? `-${Math.abs(streak)}` : `+${streak}` }}</span>
          </p>
        </div>
        <!-- MÁS JUGADO -->
        <div class="bg-neutral-950/75 border border-slate-400/40 rounded px-2 py-2 sm:px-4 sm:py-4 text-center col-span-2 md:col-span-3">
          <p class="md:text-xl font-semibold mb-2">MÁS JUGADO</p>
          <div class="flex items-center justify-center gap-2 md:gap-4">
            <div v-for="champ in mostPlayed" :key="champ.champion_id" class="flex flex-col items-center gap-3">
              <img :src="getChampionIcon(champ.champion_id)" class="w-12 h-12" :alt="String(champ.champion_id)" :title="champions?.find(c => c.id === String(champ.champion_id))!.name">
              <span class="text-xs md:text-base text-slate-400 font-semibold leading-none">
                <span class="text-blue-400">{{ champ.wins }}</span>V · <span class="text-rose-400">{{ champ.losses }}</span>D (<span class="text-slate-100">{{ champ.count }}</span>)
              </span>
              <span class="text-xs md:text-base text-slate-100 font-semibold leading-none">{{ ((champ.wins / champ.count) * 100).toFixed(1) }}% WR</span>
              <span class="text-xs text-slate-400 font-semibold leading-none">
                <span class="text-blue-400">{{ champ.kills.toFixed(0) }}</span> / <span class="text-rose-400">{{ champ.deaths.toFixed(0) }}</span> / <span class="text-yellow-200">{{ champ.assists.toFixed(0) }}</span> (<span class="text-slate-100">{{ champ.deaths > 0 ? ((Number(champ.kills.toFixed(0)) + Number(champ.assists.toFixed(0))) / (Number(champ.deaths.toFixed(0)))).toFixed(2) : "Perfect" }}</span> KDA)
              </span>
            </div>
          </div>
        </div>
        <!-- ELO MÁXIMO -->
        <div class="bg-neutral-950/75 border border-blue-300/40 rounded px-2 py-2 sm:px-4 sm:py-4 text-center flex flex-col items-center justify-center col-span-2 md:col-span-1">
          <p class="md:text-xl text-blue-200 font-semibold ">ELO MÁXIMO</p>
          <p class="text-lg md:text-2xl text-blue-200 font-bold flex flex-wrap items-center justify-center">
            <img :src="`/images/lol/${highest?.tier?.toLowerCase() || 'unranked'}.png`" class="w-12 h-12 md:w-16 md:h-16">
            <span v-if="highest?.tier">{{ highest.division }} · {{ highest.lp }} LP</span>
          </p>
        </div>
        <!-- WINRATE, VICTORIAS, DERROTAS -->
        <div class="flex flex-col gap-2 md:gap-2 col-span-2 md:col-span-1">
          <!-- WINRATE -->
          <div class="bg-neutral-950/75 border border-purple-300/40 rounded p-2 sm:p-2 text-center flex flex-col items-center justify-center">
            <p class="md:text-lg text-purple-200 font-semibold ">WINRATE</p>
            <p class="md:text-xl text-purple-200 font-bold flex flex-wrap items-center justify-center">
              {{ (user && user.wins && user.losses ? (user.wins / (user.wins + user.losses) * 100).toFixed(2) : "0.00") }}%
            </p>
          </div>
          <!-- VICTORIAS -->
          <div class="flex items-center justify-center gap-2 md:gap-2">
            <div class="bg-neutral-950/75 border border-blue-300/40 rounded p-2 sm:p-2 text-center flex flex-col items-center justify-center w-full">
              <p class="md:text-lg text-blue-200 font-semibold ">VICTORIAS</p>
              <p class="md:text-xl text-blue-200 font-bold flex items-center justify-center">
                {{ user?.wins || 0 }}
              </p>
            </div>
            <!-- DERROTAS -->
            <div class="bg-neutral-950/75 border border-rose-300/40 rounded p-2 sm:p-2 text-center flex flex-col items-center justify-center w-full">
              <p class="md:text-lg text-rose-200 font-semibold ">DERROTAS</p>
              <p class="md:text-xl text-rose-200 font-bold flex items-center justify-center">
                {{ user?.losses || 0 }}
              </p>
            </div>
          </div>
        </div>
        <!-- ELO MÍNIMO -->
        <div class="bg-neutral-950/75 border border-rose-300/40 rounded px-2 py-2 sm:px-4 sm:py-4 text-center flex flex-col items-center justify-center col-span-2 md:col-span-1">
          <p class="md:text-xl text-rose-200 font-semibold ">ELO MÍNIMO</p>
          <p class="text-lg md:text-2xl text-rose-200 font-bold flex flex-wrap items-center justify-center">
            <img :src="`/images/lol/${lowest?.tier?.toLowerCase() || 'unranked'}.png`" class="w-12 h-12 md:w-16 md:h-16">
            <span v-if="lowest?.tier">{{ lowest.division }} · {{ lowest.lp }} LP</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
