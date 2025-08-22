<script setup lang="ts">
import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { Line } from "vue-chartjs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { tooltipChart } from "../utils/tooltipChart";

const { data: champions } = await useFetch("/api/champions");

const props = defineProps<{
  matches?: History[];
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
// Nueva función para procesar los datos: cada punto es una partida
const processRealStats = (stats: typeof props.matches) => {
  if (!stats || stats.length === 0) {
    return { labels: [], data: [] };
  }
  // Ordenar las partidas por fecha
  const sortedStats = [...stats].sort((a, b) => a.date - b.date);
  const chartLabels: string[] = [];
  const gameData: Array<{ value: number, match: any }> = [];
  sortedStats.forEach((stat) => {
    const matchDate = new Date(stat.date);
    // Etiqueta: fecha y hora de la partida
    const label = format(matchDate, "dd MMM HH:mm", { locale: es });
    chartLabels.push(label);
    const tier = stat.tier ? normalizeTier[stat.tier.toUpperCase() as keyof typeof normalizeTier] : "Hierro";
    const division = stat.division || "IV";
    const lp = stat.lp || 0;
    const value = rankToValue(tier, division, lp);
    const championName = champions.value?.find(c => c.id === String(stat.champion_id))?.name;
    const match = {
      champion: championName,
      championId: stat.champion_id,
      score: {
        kills: stat.kills,
        deaths: stat.deaths,
        assists: stat.assists
      },
      lpChange: 0,
      win: stat.result === 1,
      value: value,
      time: format(matchDate, "HH:mm"),
      isRemake: stat.is_remake === 1,
      isSurrender: stat.is_surrender === 1,
      tier: stat.tier,
      date: matchDate
    };
    gameData.push({ value, match });
  });
  return { labels: chartLabels, data: gameData };
};

// Calcular el rango visible basado en los datos
const calculateVisibleRange = (data: { value: number, match: any }[]) => {
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

const { labels, data } = processRealStats(props.matches);
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
    match?: any;
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
        const tooltipData = tooltipChart(context, data, "match");
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
        display: false, // Oculta los labels del eje X
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
  <div class="chart-container" style="position:relative;">
    <Line :data="chartData" :options="chartOptions" />
    <TooltipChart
      type="match"
      :visible="tooltipState.visible"
      :x="tooltipState.x"
      :y="tooltipState.y"
      :transform="tooltipState.transform"
      :content="tooltipState.content"
    />
  </div>
</template>
