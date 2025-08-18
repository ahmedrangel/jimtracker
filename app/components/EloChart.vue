<script setup lang="ts">
import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { Line } from "vue-chartjs";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

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

// Definir los rangos de League of Legends con sus divisiones
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

// Lista de campeones populares
const CHAMPIONS = [
  "Aatrox", "Ahri", "Amumu", "Annie", "Ashe", "Azir", "Blitzcrank", "Braum",
  "Caitlyn", "Darius", "Diana", "Draven", "Ezreal", "Garen", "Graves", "Irelia",
  "Janna", "Jax", "Jinx", "Karma", "Katarina", "Kayn", "LeBlanc", "Lee Sin",
  "Leona", "Lux", "Malphite", "Master Yi", "Miss Fortune", "Morgana", "Nami",
  "Nautilus", "Orianna", "Pyke", "Riven", "Senna", "Seraphine", "Sona",
  "Soraka", "Thresh", "Tristana", "Twisted Fate", "Vayne", "Vi", "Yasuo", "Zed"
];

// Generar score aleatorio realista
const generateScore = () => {
  const kills = Math.floor(Math.random() * 15) + 1;
  const deaths = Math.floor(Math.random() * 10) + 1;
  const assists = Math.floor(Math.random() * 20) + 1;
  return { kills, deaths, assists };
};

// Generar partidas para un día
const generateDayMatches = (baseValue: number) => {
  const numMatches = Math.floor(Math.random() * 4) + 1; // 1-4 partidas por día
  const matches = [];
  let currentValue = baseValue;

  // Generar horas aleatorias para las partidas (entre 10:00 y 23:59)
  const startHour = 10; // 10:00 AM
  const endHour = 23; // 11:59 PM
  const gameHours = [];

  for (let i = 0; i < numMatches; i++) {
    const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const minute = Math.floor(Math.random() * 60);
    gameHours.push({ hour, minute, totalMinutes: hour * 60 + minute });
  }

  // Ordenar por hora (más temprano primero)
  gameHours.sort((a, b) => b.totalMinutes - a.totalMinutes);

  for (let i = 0; i < numMatches; i++) {
    const champion = CHAMPIONS[Math.floor(Math.random() * CHAMPIONS.length)];
    const score = generateScore();
    const lpChange = Math.floor(Math.random() * 50) - 25; // -25 a +25 LP por partida
    const win = lpChange >= 0;
    const gameTime = gameHours[i]!; // Sabemos que existe porque creamos el array con la misma longitud

    currentValue += lpChange;
    currentValue = Math.max(0, Math.min(3999, currentValue));

    matches.push({
      champion,
      score,
      lpChange,
      win,
      value: currentValue,
      time: `${gameTime.hour.toString().padStart(2, "0")}:${gameTime.minute.toString().padStart(2, "0")}`
    });
  }

  return { matches, finalValue: currentValue };
};

// Generar datos de ejemplo para los últimos 30 días con rangos de LoL
const generateRankData = () => {
  const gameData = [];
  const chartLabels = [];
  let currentValue = rankToValue("Oro", "II", 20); // Empezar en Gold II 20LP

  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    chartLabels.push(format(date, "dd MMM", { locale: es }));

    const dayResult = generateDayMatches(currentValue);
    currentValue = dayResult.finalValue;

    gameData.push({
      value: currentValue,
      matches: dayResult.matches
    });
  }

  return { labels: chartLabels, data: gameData };
};

// Calcular el rango visible basado en los datos
const calculateVisibleRange = (data: { value: number, matches: any[] }[]) => {
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

const { labels, data } = generateRankData();
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

          // Calcular LP total ganado/perdido del día
          const dayStartValue = dataIndex > 0 && data[dataIndex - 1] ? data[dataIndex - 1]!.value : dayData.value;
          const totalChange = dayData.value - dayStartValue;
          const changeText = totalChange > 0 ? `+${Math.round(totalChange)}` : `${Math.round(totalChange)}`;
          const changeEmoji = totalChange > 0 ? "🟢" : totalChange < 0 ? "🔴" : "⚪";

          const result = [
            `Rango final: ${rankDisplay}`,
            `Cambio total: ${changeText} LP ${changeEmoji}`,
            "",
            `📋 Partidas del día (${dayData.matches.length}):`
          ];

          dayData.matches.forEach((match) => {
            const winIcon = match.win ? "✅" : "❌";
            result.push(
              `${match.time} - ${winIcon} ${match.champion}: ${match.score.kills}/${match.score.deaths}/${match.score.assists}`
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
