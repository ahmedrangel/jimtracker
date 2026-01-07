import { format } from "date-fns";
import { es } from "date-fns/locale";

export const LEAGUE_TIERS = [
  { id: "IRON", name: "I", divisions: ["IV", "III", "II", "I"], color: "#6B4E24" },
  { id: "BRONZE", name: "B", divisions: ["IV", "III", "II", "I"], color: "#A0522D" },
  { id: "SILVER", name: "S", divisions: ["IV", "III", "II", "I"], color: "#C0C0C0" },
  { id: "GOLD", name: "G", divisions: ["IV", "III", "II", "I"], color: "#FFD700" },
  { id: "PLATINUM", name: "P", divisions: ["IV", "III", "II", "I"], color: "#40E0D0" },
  { id: "EMERALD", name: "E", divisions: ["IV", "III", "II", "I"], color: "#50C878" },
  { id: "DIAMOND", name: "D", divisions: ["IV", "III", "II", "I"], color: "#B9F2FF" },
  { id: "MASTER", name: "M", divisions: [""], color: "#9932CC" },
  { id: "GRANDMASTER", name: "GM", divisions: [""], color: "#DC143C" },
  { id: "CHALLENGER", name: "CH", divisions: [""], color: "#F7931E" }
];

export const romanNumerals: { [key: string]: number } = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4
};

const divisionValues = { IV: 0, III: 100, II: 200, I: 300 };

export const getTierName = (id: string) => {
  const tier = LEAGUE_TIERS.find(t => t.id === id);
  return tier ? tier.name : "";
};

export const tierToValue = (tier: string, division: string, lp: number): number => {
  const tierIndex = LEAGUE_TIERS.findIndex(t => t.name.toLowerCase() === tier.toLowerCase());
  if (tierIndex === -1) return 0;

  const baseValue = tierIndex * 400; // 400 puntos por tier

  if (tier.toLowerCase() === "m" || tier.toLowerCase() === "gm" || tier.toLowerCase() === "ch") {
    return baseValue + lp;
  }

  const divisionValue = divisionValues[division as keyof typeof divisionValues] || 0;
  return baseValue + divisionValue + lp;
};

export const valueToTier = (value: number): { id: string, tier: string, division: string, lp: number } => {
  const tierIndex = Math.floor(value / 400);
  const remainder = value % 400;

  if (tierIndex >= LEAGUE_TIERS.length) {
    return { id: "CHALLENGER", tier: "CH", division: "", lp: Math.min(remainder, 9999) };
  }

  const tier = LEAGUE_TIERS[tierIndex];

  if (!tier) {
    return { id: "IRON", tier: "I", division: "IV", lp: 0 };
  }

  if (tier.name === "M" || tier.name === "GM" || tier.name === "CH") {
    return { id: tier.id, tier: tier.name, division: "", lp: Math.min(remainder, 9999) };
  }

  const divisionIndex = Math.floor(remainder / 100);
  const lp = remainder % 100;

  return {
    id: tier.id,
    tier: tier.name,
    division: Object.keys(divisionValues)[divisionIndex] || "IV",
    lp: Math.min(lp, 100) // LP siempre entre 0 y 100
  };
};

// Calcular el rango visible de la gráfica basado en los datos
export const calculateChartVisibleRange = (data: ChartXData[]) => {
  if (!data?.length) {
    return { min: 0, max: 400, tiers: LEAGUE_TIERS.slice(0, 1) };
  }

  const minRange = Math.min(...data.map(d => d.value));
  const maxRange = Math.max(...data.map(d => d.value));

  // Mostrar 2 divisiones adicionales arriba y abajo (200 puntos = 2 divisiones)
  const expandedMin = Math.max(0, minRange - 200);
  const expandedMax = Math.min(3999, maxRange + 200); // Cap at Challenger 999LP

  const minTier = Math.floor(expandedMin / 400);
  const maxTier = Math.floor(expandedMax / 400);

  return {
    min: expandedMin,
    max: expandedMax,
    tiers: LEAGUE_TIERS.slice(minTier, maxTier + 1)
  };
};

export const processChartData = (data: HistoryData[], champions: { id: string, name: string }[], type: "daily" | "match") => {
  const stats = data;

  if (!stats?.length) return { labels: [], data: [] };

  if (type === "daily") {
    const firstMatch = stats[stats.length - 1]!;
    const lastMatch = stats[0]!;

    // Stats por día
    const matchPerDay = new Map<string, typeof stats>();

    for (const stat of stats) {
      const dateKey = format(stat.date, "yyyy-MM-dd");
      if (!matchPerDay.has(dateKey)) matchPerDay.set(dateKey, []);
      matchPerDay.get(dateKey)!.push(stat);
    }

    const firstMatchDate = new Date(firstMatch.date);
    const lastMatchDate = new Date(lastMatch.date);
    lastMatchDate.setHours(23, 59, 59, 999);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const chartLabels: string[] = [];
    const dayData: ChartXData[] = [];

    for (let d = new Date(firstMatchDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, "yyyy-MM-dd");
      const dayLabel = format(d, "dd MMM", { locale: es });

      if (lastMatchDate >= d) {
        chartLabels.push(dayLabel);
      }

      const dayMatches = matchPerDay.get(dateKey)?.sort((a, b) => a.date - b.date) || [];
      if (dayMatches.length) {
        const lastMatch = dayMatches[dayMatches.length - 1]!;
        const tier = lastMatch.tier ? getTierName(lastMatch.tier) : "I";
        const division = lastMatch.division || "IV";
        const lp = lastMatch.lp || 0;

        const value = tierToValue(tier, division, lp);

        const matches = dayMatches.map((stat) => {
          const championName = champions?.find(c => c.id === String(stat.champion_id))?.name || "";
          return {
            ...stat,
            value,
            champion: championName
          };
        });

        dayData.push({ value, data: matches });
      }
      else {
      // Si no hay datos para este día, usar el valor del día anterior
        const previousValue = dayData.length ? dayData[dayData.length - 1]!.value : tierToValue("I", "IV", 0);
        dayData.push({ value: previousValue, data: [] });
      }
    }
    return { labels: chartLabels, data: dayData };
  }
  else {
    const matchesData = [...stats].sort((a, b) => a.date - b.date);
    const chartLabels: string[] = [];
    const gamesData: ChartXData[] = [];
    for (const stat of matchesData) {
      const label = "";
      chartLabels.push(label);
      const tier = stat.tier ? getTierName(stat.tier) : "I";
      const division = stat.division || "IV";
      const lp = stat.lp || 0;
      const value = tierToValue(tier, division, lp);
      const championName = champions?.find(c => c.id === String(stat.champion_id))?.name || "";
      const match = {
        ...stat,
        champion: championName,
        value: value
      };
      gamesData.push({ value, data: match });
    }
    return { labels: chartLabels, data: gamesData };
  }
};
