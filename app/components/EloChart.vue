<script setup lang="ts">
import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { Line } from "vue-chartjs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { tooltipChart } from "../utils/tooltipChart";

const { data: champions } = await useFetch("/api/champions");

const props = defineProps<{
  history?: History[];
}>();

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Función para procesar los datos reales de stats
const processRealStats = (stats: typeof props.history) => {
  if (!stats || stats.length === 0) {
    // No hay datos disponibles
    return { labels: [], data: [] };
  }

  // Ordenar stats por fecha para encontrar la primera partida
  const sortedStats = [...stats].sort((a, b) => a.date - b.date);
  const firstMatch = sortedStats[0]!;

  // Agrupar stats por día
  const statsByDay = new Map<string, typeof stats>();

  stats.forEach((stat) => {
    const date = new Date(stat.date);
    const dateKey = format(date, "yyyy-MM-dd");

    if (!statsByDay.has(dateKey)) {
      statsByDay.set(dateKey, []);
    }
    statsByDay.get(dateKey)!.push(stat);
  });

  // Encontrar el primer y último día con datos
  const daysWithData = Array.from(statsByDay.keys()).sort();
  if (daysWithData.length === 0) {
    return { labels: [], data: [] };
  }

  // Usar la fecha y hora exacta de la primera partida
  const firstMatchDate = new Date(firstMatch.date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Asegurar que incluya todo el día de hoy

  // Generar solo los días desde el primer día con datos hasta hoy
  const chartLabels: string[] = [];
  const gameData: Array<{ value: number, matches: any[] }> = [];

  // Empezar desde la fecha de la primera partida, pero mantener la lógica de días completos
  let currentDate = new Date(firstMatchDate);
  currentDate.setHours(0, 0, 0, 0); // Empezar desde medianoche del día de la primera partida

  // Usar los datos de la primera partida como punto de referencia
  // Si la primera partida no tiene tier/division/lp, usar valores por defecto
  const firstTier = firstMatch.tier ? normalizeTier[firstMatch.tier.toUpperCase() as keyof typeof normalizeTier] : "Hierro";
  const firstDivision = firstMatch.division || "IV";
  const firstLp = firstMatch.lp || 0;
  let previousValue = rankToValue(firstTier, firstDivision, firstLp);

  while (currentDate <= today) {
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const dayLabel = format(currentDate, "dd MMM", { locale: es });

    chartLabels.push(dayLabel);

    const dayStats = statsByDay.get(dateKey) || [];

    // Si hay stats para este día, usar el último LP/tier del día
    if (dayStats.length > 0) {
      // IMPORTANTE: Ordenar las partidas del día por fecha para obtener la última partida real
      const sortedDayStats = dayStats.sort((a, b) => a.date - b.date);
      const lastStat = sortedDayStats[sortedDayStats.length - 1]!;
      const tier = lastStat.tier ? normalizeTier[lastStat.tier.toUpperCase() as keyof typeof normalizeTier] : "Hierro";
      const division = lastStat.division || "IV";
      const lp = lastStat.lp || 0;

      const value = rankToValue(tier, division, lp);
      previousValue = value; // Actualizar el valor anterior

      // Convertir stats a formato de matches (también ordenados)
      const matches = sortedDayStats.map((stat) => {
        const matchDate = new Date(stat.date);
        const championName = champions.value?.find(c => c.id === String(stat.champion_id))?.name;
        return {
          champion: championName,
          championId: stat.champion_id,
          score: {
            kills: stat.kills,
            deaths: stat.deaths,
            assists: stat.assists
          },
          lpChange: 0, // No tenemos el cambio exacto de LP por partida
          win: stat.result === 1,
          value: value,
          time: format(matchDate, "HH:mm"),
          isRemake: stat.is_remake === 1,
          isSurrender: stat.is_surrender === 1,
          tier: stat.tier
        };
      });

      gameData.push({ value, matches });
    }
    else {
      // Si no hay datos para este día, usar el valor del día anterior
      gameData.push({ value: previousValue, matches: [] });
    }

    // Avanzar al siguiente día
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { labels: chartLabels, data: gameData };
};

// Calcular el rango visible basado en los datos
const calculateVisibleRange = (data: { value: number, matches: any[] }[]) => {
  // Si no hay datos, usar valores por defecto
  if (!data || data.length === 0) {
    return {
      min: 0,
      max: 400,
      tiers: LEAGUE_TIERS.slice(0, 1) // Solo mostrar Hierro
    };
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));

  // Mostrar 2 divisiones adicionales arriba y abajo (200 puntos = 2 divisiones)
  const expandedMin = Math.max(0, minValue - 200);
  const expandedMax = Math.min(3999, maxValue + 200); // Cap at Challenger 999LP

  const minTier = Math.floor(expandedMin / 400);
  const maxTier = Math.floor(expandedMax / 400);

  return {
    min: expandedMin,
    max: expandedMax,
    tiers: LEAGUE_TIERS.slice(minTier, maxTier + 1)
  };
};

const { labels, data } = processRealStats(props.history);
const visibleRange = calculateVisibleRange(data);

const chartData = ref({
  labels,
  datasets: [
    {
      label: "Rango de LoL",
      data: data.map(d => d.value),
      borderWidth: 2,
      fill: true,
      tension: 0.15,
      pointBackgroundColor: data.map((d) => {
        const rank = valueToRank(d.value);
        const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
        return tier?.color || "#3B82F6";
      }),
      pointBorderColor: "#ffffffaa",
      pointBorderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 12,
      pointHoverBorderColor: "#ffffffaa",
      pointHoverBorderWidth: 2,
      segment: {
        borderColor: (ctx: any) => {
          const value = ctx.p0.raw;
          const rank = valueToRank(value);
          const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
          return tier?.color || "#3B82F6";
        },
        backgroundColor: (ctx: any) => {
          const value = ctx.p0.raw;
          const rank = valueToRank(value);
          const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
          return tier?.color ? `${tier.color}0d` : "#3B82F6";
        }
      }
    }
  ]
});

const tooltipState = ref<{
  visible: boolean;
  x: any;
  y: any;
  transform: string;
  content?: {
    label: string;
    rankDisplay: string;
    changeText: string;
    changeIcon: string;
    matches?: any[];
  }; }>({
  visible: false,
  x: 0,
  y: 0,
  transform: "translate(-50%, -50%)",
  content: undefined
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "nearest",
    intersect: false
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      position: "nearest",
      enabled: false,
      external: (context: any) => {
        const tooltipData = tooltipChart(context, data, "daily");
        tooltipState.value = tooltipData;
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: "rgba(148, 163, 184, 0.2)",
        borderDash: [2, 2]
      },
      ticks: {
        color: "#fff",
        font: {
          size: 12
        }
      }
    },
    y: {
      min: Math.floor(visibleRange.min / 100) * 100, // Redondear al múltiplo de 100 más cercano
      max: Math.ceil(visibleRange.max / 100) * 100, // Redondear al múltiplo de 100 más cercano
      grid: {
        color: "rgba(148, 163, 184, 0.2)",
        borderDash: [2, 2]
      },
      ticks: {
        color: "#fff",
        font: {
          size: 12
        },
        callback: function (value: string | number) {
          const numValue = Number(value);
          // Solo mostrar etiquetas en valores exactos de divisiones (múltiplos de 100)
          if (numValue % 100 !== 0) return "";

          const rank = valueToRank(numValue);
          let display = rank.tier;
          if (rank.division) {
            display += ` ${rank.division}`;
          }
          return display;
        },
        // Mostrar etiquetas cada 100 puntos (cada división)
        stepSize: 100,
        maxTicksLimit: 15
      }
    }
  }
} as const);
</script>

<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
    <TooltipChart
      type="daily"
      :visible="tooltipState.visible"
      :x="tooltipState.x"
      :y="tooltipState.y"
      :transform="tooltipState.transform"
      :content="tooltipState.content"
    />
  </div>
</template>
