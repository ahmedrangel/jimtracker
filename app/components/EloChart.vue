<script setup lang="ts">
import { CategoryScale, type ChartData, Chart as ChartJS, type ChartOptions, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { Line } from "vue-chartjs";

const props = defineProps<{
  type: "daily" | "match";
  history?: History[];
  champions?: { id: string, name: string }[];
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

const computedChartHistory = computed((): ChartLabelsAndData => {
  return processChartData(props.history || [], props.champions || [], props.type);
});

const visibleRange = computed(() => calculateChartVisibleRange(computedChartHistory.value.data));

const chartData = computed((): ChartData<"line"> => ({
  labels: computedChartHistory.value.labels,
  datasets: [
    {
      label: "Rango de LoL",
      data: computedChartHistory.value.data.map(d => d.value),
      borderWidth: 2,
      fill: true,
      tension: props.type === "daily" ? 0.15 : 0.25,
      pointBackgroundColor: computedChartHistory.value.data.map((d) => {
        const rank = valueToTier(d.value);
        const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
        return tier?.color || "#3B82F6";
      }),
      pointRadius: 2,
      pointHoverRadius: 8,
      segment: {
        borderColor: (ctx) => {
          const value = ctx.p0.parsed.y;
          const rank = valueToTier(value);
          const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
          return tier?.color || "#3B82F6";
        },
        backgroundColor: (ctx) => {
          const value = ctx.p0.parsed.y;
          const rank = valueToTier(value);
          const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
          return tier?.color ? `${tier.color}1a` : "#3B82F6";
        }
      }
    }
  ]
}));

const tooltipState = ref();

const chartOptions = computed((): ChartOptions<"line"> => ({
  responsive: true,
  maintainAspectRatio: false,
  devicePixelRatio: window.devicePixelRatio + 0.5,
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
      external: (context) => {
        const tooltipData = tooltipChart(context, computedChartHistory.value.data, props.type);
        tooltipState.value = tooltipData;
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: "rgba(148, 163, 184, 0.1)"
      },
      ticks: {
        color: "#fff",
        font: {
          size: 12,
          family: "Arial, sans-serif"
        }
      }
    },
    y: {
      min: Math.floor(visibleRange.value.min / 100) * 100, // Redondear al múltiplo de 100 más cercano
      max: Math.ceil(visibleRange.value.max / 100) * 100, // Redondear al múltiplo de 100 más cercano
      grid: {
        color: (ctx) => {
          const value = Number(ctx.tick.value);
          const rank = valueToTier(value);
          const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
          return tier?.color ? `${tier.color}33` : "rgba(148, 163, 184, 0.2)";
        }
      },
      ticks: {
        color: (ctx) => {
          const value = Number(ctx.tick.value);
          const rank = valueToTier(value);
          const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
          return tier?.color || "#fff";
        },
        font: {
          size: 12,
          family: "Arial, sans-serif"
        },
        callback: (value: string | number) => {
          const numValue = Number(value);
          // Solo mostrar etiquetas en valores exactos de divisiones (múltiplos de 100)
          if (numValue % 100 !== 0) return "";
          const rank = valueToTier(numValue);
          let display = rank.tier;
          if (rank.division) {
            display += `${romanNumerals[rank.division]}`;
          }
          return display;
        },
        stepSize: 100,
        maxTicksLimit: 15
      }
    }
  }
}));
</script>

<template>
  <div class="chart-container">
    <ClientOnly>
      <Line :data="chartData" :options="chartOptions" />
    </ClientOnly>
    <TooltipChart :type="type" :style="tooltipState?.style" :content="tooltipState?.content" />
  </div>
</template>
