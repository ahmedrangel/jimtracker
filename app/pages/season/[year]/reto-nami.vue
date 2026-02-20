<script setup lang="ts">
import challengeJson from "~/assets/json/nami-challenge.json";
import { tierToValue, valueToTier } from "~/utils/chart";

type ChallengeMatch = (typeof challengeJson)[number];

type JourneyMatch = ChallengeMatch & {
  originalIndex: number;
  parsedDate: Date;
  dateISO: string;
  challengeType: "nami" | "free" | "ban";
  kda: [number, number, number];
};

const { params } = useRoute("season-year");
const challengeData = challengeJson;

const parseDate = (value: string) => {
  const [rawDay = 1, rawMonth = 1, rawYear = 2026] = value.split("/").map(Number);
  const day = Number.isFinite(rawDay) ? rawDay : 1;
  const month = Number.isFinite(rawMonth) ? rawMonth : 1;
  const year = Number.isFinite(rawYear) ? rawYear : 2026;

  return new Date(Date.UTC(year, month - 1, day));
};

const firstMatch = challengeData[0];
const challengeYear = firstMatch ? parseDate(firstMatch.date).getUTCFullYear() : new Date().getUTCFullYear();

if (Number(params.year) !== challengeYear) {
  throw createError({ statusCode: 404 });
}

const rankToTierMap: Record<string, string> = {
  Oro: "G",
  Platino: "P"
};

const parseScore = (value: string): [number, number, number] => {
  const [rawKills = 0, rawDeaths = 0, rawAssists = 0] = value.split("/").map(Number);
  const kills = Number.isFinite(rawKills) ? rawKills : 0;
  const deaths = Number.isFinite(rawDeaths) ? rawDeaths : 0;
  const assists = Number.isFinite(rawAssists) ? rawAssists : 0;

  return [kills, deaths, assists];
};

const getChallengeType = (match: ChallengeMatch): JourneyMatch["challengeType"] => {
  if (match.isNamiBan) return "ban";
  if (match.isFreePick) return "free";
  return "nami";
};

const getChampionImage = (championId: number | null) => {
  return championId ? getChampionIcon(championId) : "https://cdn.communitydragon.org/latest/profile-icon/29";
};

const rankPoints = (match: ChallengeMatch) => {
  const tierName = rankToTierMap[match.rango] ?? "I";
  return tierToValue(tierName, match.division, match.lp);
};

const journeyData = computed<JourneyMatch[]>(() => {
  return challengeData
    .map((match, index) => {
      const parsedDate = parseDate(match.date);
      return {
        ...match,
        originalIndex: index,
        parsedDate,
        dateISO: parsedDate.toISOString(),
        challengeType: getChallengeType(match),
        kda: parseScore(match.score)
      };
    });
});

const groupedJourney = computed(() => {
  const groups = new Map<string, JourneyMatch[]>();

  for (const match of journeyData.value) {
    const key = match.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(match);
  }

  return Array.from(groups.entries()).map(([date, matches]) => ({
    date,
    dateISO: parseDate(date).toISOString(),
    matches
  }));
});

const stats = computed(() => {
  const total = journeyData.value.length;
  const namiGames = journeyData.value.filter(match => match.challengeType === "nami").length;
  const banGames = journeyData.value.filter(match => match.challengeType === "ban").length;
  const freeGames = journeyData.value.filter(match => match.challengeType === "free").length;

  return { total, namiGames, banGames, freeGames };
});

const lpChangeClass = (value: number) => {
  if (value > 0) return "text-blue-400";
  if (value < 0) return "text-red-400";
  return "text-slate-400";
};
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-4">
      <h1 class="text-4xl font-bold text-center">Reto Nami</h1>
      <p class="text-center md:text-balance text-lg">
        Este reto consistía en subir una liga completa jugando principalmente con Nami y completar el ascenso manteniendo un recorrido de partidas,
        incluyendo excepciones por baneos y partidas de pickeo libre después de ganar una con Nami.
      </p>
      <div class="flex flex-col md:flex-row items-center justify-center gap-2">
        <p class="text-sm">
          <strong>Fecha de inicio:</strong> <span class="text-muted">14 de febrero de 2026</span>
        </p>
        <span class="hidden md:block">•</span>
        <p class="text-sm">
          <strong>Fecha de finalización:</strong> <span class="text-muted">19 de febrero de 2026</span>
        </p>
        <span class="hidden md:block">•</span>
        <p class="text-sm">
          <strong>Duración:</strong> <span class="text-muted">6 días</span>
        </p>
      </div>
    </div>

    <USeparator
      class="py-4"
      :ui="{ border: 'border-slate-400/40', avatar: 'bg-transparent' }"
      :avatar="{ src: '/images/jimrsng.png', size: 'md' }"
    />

    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
      <div class="text-center px-4 py-4 bg-neutral-950/75 border border-slate-400/40 rounded">
        <div class="text-xl font-bold">{{ stats.total }}</div>
        <div class="text-sm text-gray-400">Partidas</div>
      </div>
      <div class="text-center px-4 py-4 bg-neutral-950/75 border border-slate-400/40 rounded">
        <div class="text-xl font-bold text-cyan-300">{{ stats.namiGames }}</div>
        <div class="text-sm text-gray-400">Con Nami</div>
      </div>
      <div class="text-center px-4 py-4 bg-neutral-950/75 border border-slate-400/40 rounded">
        <div class="text-xl font-bold text-red-400">{{ stats.banGames }}</div>
        <div class="text-sm text-gray-400">Nami baneada</div>
      </div>
      <div class="text-center px-4 py-4 bg-neutral-950/75 border border-slate-400/40 rounded">
        <div class="text-xl font-bold text-amber-300">{{ stats.freeGames }}</div>
        <div class="text-sm text-gray-400">Free pick</div>
      </div>
    </div>

    <div v-if="!groupedJourney.length" class="text-center text-muted py-12 bg-neutral-950/75 border border-slate-400/40 rounded">
      No hay partidas registradas.
    </div>

    <div v-else class="space-y-6">
      <section v-for="(group, groupIndex) in groupedJourney" :key="group.date" class="space-y-2 border border-slate-400/40 bg-neutral-950/75 rounded p-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:calendar" class="text-muted" />
          <h2 class="text-sm md:text-base text-muted">
            <NuxtTime :datetime="group.dateISO" weekday="long" day="numeric" month="long" year="numeric" locale="es" time-zone="UTC" />
          </h2>
        </div>

        <div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-cols-1 gap-2 md:gap-3">
            <template v-for="(match, index) in group.matches" :key="`${match.date}-${match.originalIndex}`">
              <div class="flex md:flex-row flex-col items-center gap-2 w-full">
                <article
                  class="flex items-center border border-slate-400/40 rounded bg-black/20 w-full"
                  :class="{
                    'border-s-4 border-s-blue-400': match.result === 'win',
                    'border-s-4 border-s-red-400': match.result === 'loss',
                    'border-s-4 border-s-slate-400': match.result === 'remake',
                  }"
                >
                  <div class="ps-4 py-4">
                    <img :src="getChampionImage(match.championId)" :alt="match.champion" class="size-16 rounded border-2 border-slate-400/40">
                  </div>

                  <div class="ps-4 pe-4 xl:pe-16 py-4 me-auto">
                    <div class="font-semibold text-muted text-sm">{{ match.champion }}</div>
                    <div class="font-bold leading-none">{{ match.score }}</div>
                    <div class="text-sm font-semibold flex items-center gap-1">
                      <span class="text-slate-400">{{ match.lpChange > 0 ? `+${match.lpChange}` : match.lpChange }} LP</span>
                      <Icon v-if="match.lpChange !== 0" :class="lpChangeClass(match.lpChange)" :name="match.lpChange > 0 ? 'tabler:caret-up-filled' : 'tabler:caret-down-filled'" />
                      <span v-if="match.result === 'remake'" class="text-xs text-gray-500">({{ match.result }})</span>
                    </div>
                  </div>

                  <div class="border-l border-slate-400/40 flex flex-col items-center justify-center p-4">
                    <div class="flex items-center gap-1">
                      <img
                        :src="`/images/lol/${valueToTier(rankPoints(match)).id.toLowerCase()}.png`"
                        :alt="match.rango"
                        class="size-10"
                      >
                      <div class="text-xl text-white">
                        {{ match.division }}
                      </div>
                    </div>
                    <div class="text-sm text-slate-400">
                      {{ match.lp }} LP
                    </div>
                  </div>
                </article>

                <div v-if="index < group.matches.length - 1" class="relative">
                  <div v-if="group.matches[index + 1]?.isNamiBan" class="absolute md:-top-6 top-0 md:right-0 -right-6">
                    <UPopover
                      v-if="group.matches[index + 1]!.championId === 267 || group.matches[index + 1]!.championId === 161"
                      mode="hover"
                    >
                      <UButton variant="link" class="p-0">
                        <img :src="getChampionImage(267)" alt="Nami" class="size-5 rounded-sm border-2 border-slate-400/40">
                        <Icon
                          name="ph:prohibit-inset-bold"
                          class="absolute bottom-0 translate-x-1/2 right-2.5 text-red-400"
                          size="0.75rem"
                        />
                      </UButton>
                      <template #content>
                        <div class="text-sm p-2">
                          Banearon a Nami, utiliza Vel'Koz para la siguiente partida.
                        </div>
                      </template>
                    </UPopover>
                  </div>
                  <div v-else-if="group.matches[index + 1]?.isFreePick" class="absolute md:-top-6 top-0 md:right-0 -right-6">
                    <UPopover mode="hover">
                      <UButton variant="link" class="p-0">
                        <Icon
                          name="lol:fill"
                          class="text-orange-300"
                          size="1.25rem"
                        />
                      </UButton>
                      <template #content>
                        <div class="text-sm p-2">
                          Siguiente partida de pickeo libre
                        </div>
                      </template>
                    </UPopover>
                  </div>
                  <Icon
                    name="lucide:arrow-right"
                    class="text-slate-500 shrink-0 hidden md:block"
                    size="1.25rem"
                  />
                  <Icon
                    name="lucide:arrow-down"
                    class="text-slate-500 shrink-0 md:hidden"
                    size="1.25rem"
                  />
                </div>
                <div v-else-if="index === group.matches.length - 1" class="flex items-center gap-2 relative">
                  <div
                    v-if="groupedJourney[groupIndex + 1]?.matches[0]?.championId === 161"
                    class="absolute md:-top-6 top-0 md:right-0 -right-6"
                  >
                    <UPopover mode="hover">
                      <UButton variant="link" class="p-0">
                        <img :src="getChampionImage(267)" alt="Nami" class="size-5 rounded-sm border-2 border-slate-400/40">
                        <Icon
                          name="ph:prohibit-inset-bold"
                          class="absolute bottom-0 translate-x-1/2 right-2.5 text-red-400"
                          size="0.75rem"
                        />
                      </UButton>
                      <template #content>
                        <div class="text-sm p-2">
                          Banearon a Nami, utiliza Vel'Koz para la siguiente partida.
                        </div>
                      </template>
                    </UPopover>
                  </div>
                  <div v-else-if="groupedJourney[groupIndex + 1]?.matches[0]?.isFreePick" class="absolute md:-top-6 top-0 md:right-0 -right-6">
                    <UPopover mode="hover">
                      <UButton variant="link" class="p-0">
                        <Icon
                          name="lol:fill"
                          class="text-orange-300"
                          size="1.25rem"
                        />
                      </UButton>
                      <template #content>
                        <div class="text-sm p-2">
                          Siguiente partida de pickeo libre
                        </div>
                      </template>
                    </UPopover>
                  </div>
                  <UPopover mode="hover">
                    <UButton variant="link" class="p-0">
                      <Icon
                        name="tabler:circle-filled"
                        class="text-slate-400"
                        size="1.25rem"
                      />
                    </UButton>
                    <template #content>
                      <div class="text-sm p-2">
                        Fin del día
                      </div>
                    </template>
                  </UPopover>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
