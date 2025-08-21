<script setup lang="ts">
import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { Line } from "vue-chartjs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

const normalizeTier = {
  IRON: "Hierro",
  BRONZE: "Bronce",
  SILVER: "Plata",
  GOLD: "Oro",
  PLATINUM: "Platino",
  EMERALD: "Esmeralda",
  DIAMOND: "Diamante",
  MASTER: "Maestro",
  GRANDMASTER: "Gran Maestro",
  CHALLENGER: "Retador"
};

const LEAGUE_TIERS = [
  { name: "Hierro", divisions: ["IV", "III", "II", "I"], color: "#6B4E24" },
  { name: "Bronce", divisions: ["IV", "III", "II", "I"], color: "#A0522D" },
  { name: "Plata", divisions: ["IV", "III", "II", "I"], color: "#C0C0C0" },
  { name: "Oro", divisions: ["IV", "III", "II", "I"], color: "#FFD700" },
  { name: "Platino", divisions: ["IV", "III", "II", "I"], color: "#40E0D0" },
  { name: "Esmeralda", divisions: ["IV", "III", "II", "I"], color: "#50C878" },
  { name: "Diamante", divisions: ["IV", "III", "II", "I"], color: "#B9F2FF" },
  { name: "Maestro", divisions: [""], color: "#9932CC" },
  { name: "Gran Maestro", divisions: [""], color: "#DC143C" },
  { name: "Retador", divisions: [""], color: "#F7931E" }
];

// Convertir rango y LP a valor numérico para el gráfico
const rankToValue = (tier: string, division: string, lp: number): number => {
  const tierIndex = LEAGUE_TIERS.findIndex(t => t.name.toLowerCase() === tier.toLowerCase());
  if (tierIndex === -1) return 0;

  let baseValue = tierIndex * 400; // 400 puntos por tier

  if (tier.toLowerCase() === "maestro" || tier.toLowerCase() === "gran maestro" || tier.toLowerCase() === "retador") {
    // Para rangos sin divisiones, usar directamente los LP
    baseValue += lp;
  }
  else {
    // Para rangos con divisiones
    const divisionValues = { IV: 0, III: 100, II: 200, I: 300 };
    baseValue += divisionValues[division as keyof typeof divisionValues] || 0;
    baseValue += lp; // Añadir LP dentro de la división
  }

  return baseValue;
};

// Convertir valor numérico de vuelta a rango
const valueToRank = (value: number): { tier: string, division: string, lp: number } => {
  const tierIndex = Math.floor(value / 400);
  const remainder = value % 400;

  if (tierIndex >= LEAGUE_TIERS.length) {
    return { tier: "Retador", division: "", lp: Math.min(remainder, 9999) };
  }

  const tier = LEAGUE_TIERS[tierIndex];

  if (!tier) {
    return { tier: "Hierro", division: "IV", lp: 0 };
  }

  if (tier.name === "Maestro" || tier.name === "Gran Maestro" || tier.name === "Retador") {
    return { tier: tier.name, division: "", lp: Math.min(remainder, 9999) };
  }

  const divisionIndex = Math.floor(remainder / 100);
  const lp = remainder % 100;
  const divisions = ["IV", "III", "II", "I"];

  return {
    tier: tier.name,
    division: divisions[divisionIndex] || "IV",
    lp: Math.min(lp, 100)
  };
};

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
      const lastStat = dayStats[dayStats.length - 1]!;
      const tier = lastStat.tier ? normalizeTier[lastStat.tier.toUpperCase() as keyof typeof normalizeTier] : "Hierro";
      const division = lastStat.division || "IV";
      const lp = lastStat.lp || 0;

      const value = rankToValue(tier, division, lp);
      previousValue = value; // Actualizar el valor anterior

      // Convertir stats a formato de matches
      const matches = dayStats.map((stat) => {
        const matchDate = new Date(stat.date);
        const championName = Object.values(champions.value || {}).find(c => c.key === String(stat.champion_id))?.name;
        return {
          champion: championName,
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
          isSurrender: stat.is_surrender === 1
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
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: data.map((d) => {
        const rank = valueToRank(d.value);
        const tier = LEAGUE_TIERS.find(t => t.name === rank.tier);
        return tier?.color || "#3B82F6";
      }),
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 3
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      titleFont: {
        size: 16,
        weight: "bold" as const
      },
      bodyFont: {
        size: 13
      },
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: "#3B82F6",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      padding: 12,
      boxPadding: 6,
      callbacks: {
        title: function (context: unknown[]) {
          return (context as any)?.[0]?.label ? `Fecha: ${(context as any)[0].label}` : "";
        },
        label: function (context: unknown) {
          const ctx = context as any;
          const dataIndex = ctx.dataIndex;
          const dayData = data[dataIndex];

          if (!dayData || !dayData.matches) {
            return "No hay datos de partidas";
          }

          const currentRank = valueToRank(dayData.value);
          let rankDisplay = currentRank.tier;
          if (currentRank.division) {
            rankDisplay += ` ${currentRank.division}`;
          }
          rankDisplay += ` (${currentRank.lp} LP)`;

          // Calcular LP total ganado/perdido comparado con el día anterior
          const previousDayValue = dataIndex > 0 ? data[dataIndex - 1]!.value : dayData.value;
          const totalChange = dayData.value - previousDayValue;
          const changeText = totalChange > 0 ? `+${Math.round(totalChange)}` : `${Math.round(totalChange)}`;
          const changeEmoji = totalChange > 0 ? "🟢" : totalChange < 0 ? "🔴" : "⚪";

          const result = [
            `Rango final: ${rankDisplay}`,
            `Cambio: ${changeText} LP ${changeEmoji}`,
            "",
            `📋 Partidas: ${dayData.matches.length}`
          ];

          dayData.matches.forEach((match: any) => {
            const winIcon = match.win ? "✅" : "❌";
            const remakeText = match.isRemake ? " (Remake)" : "";
            const surrenderText = match.isSurrender ? " (Surrender)" : "";
            result.push(
              `${match.time} - ${winIcon} ${match.champion}: ${match.score.kills}/${match.score.deaths}/${match.score.assists}${remakeText}${surrenderText}`
            );
          });

          return result;
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: "index" as const
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
  },
  elements: {
    line: {
      borderJoinStyle: "round" as const,
      borderCapStyle: "round" as const
    }
  }
} as const);
</script>

<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
}
</style>
