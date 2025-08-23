// Helpers
export const socials = [
  {
    id: "twitch",
    title: "Twitch",
    icon: "simple-icons:twitch",
    url: "https://www.twitch.tv/jimrsng"
  },
  {
    id: "kick",
    title: "Kick",
    icon: "simple-icons:kick",
    url: "https://kick.com/jimrisingtv"
  },
  {
    id: "x",
    title: "X",
    icon: "simple-icons:x",
    url: "https://x.com/JimRisingSC"
  },
  {
    id: "instagram",
    title: "Instagram",
    icon: "simple-icons:instagram",
    url: "https://www.instagram.com/Jimrising12"
  },
  {
    id: "tiktok",
    title: "TikTok",
    icon: "simple-icons:tiktok",
    url: "https://www.tiktok.com/@jimrising"
  },
  {
    id: "facebook",
    title: "Facebook",
    icon: "simple-icons:facebook",
    url: "https://www.facebook.com/JimRisingSC2"
  },
  {
    id: "youtube",
    title: "YouTube",
    icon: "simple-icons:youtube",
    url: "https://www.youtube.com/channel/UCyLusY-ST8KxpXe1A67r37A"
  }
];

export const LEAGUE_TIERS = [
  { id: "IRON", name: "Hierro", divisions: ["IV", "III", "II", "I"], color: "#6B4E24" },
  { id: "BRONZE", name: "Bronce", divisions: ["IV", "III", "II", "I"], color: "#A0522D" },
  { id: "SILVER", name: "Plata", divisions: ["IV", "III", "II", "I"], color: "#C0C0C0" },
  { id: "GOLD", name: "Oro", divisions: ["IV", "III", "II", "I"], color: "#FFD700" },
  { id: "PLATINUM", name: "Platino", divisions: ["IV", "III", "II", "I"], color: "#40E0D0" },
  { id: "EMERALD", name: "Esmeralda", divisions: ["IV", "III", "II", "I"], color: "#50C878" },
  { id: "DIAMOND", name: "Diamante", divisions: ["IV", "III", "II", "I"], color: "#B9F2FF" },
  { id: "MASTER", name: "Maestro", divisions: [""], color: "#9932CC" },
  { id: "GRANDMASTER", name: "Gran Maestro", divisions: [""], color: "#DC143C" },
  { id: "CHALLENGER", name: "Retador", divisions: [""], color: "#F7931E" }
];

export const normalizeTier = {
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

// Convertir rango y LP a valor numérico para el gráfico
export const rankToValue = (tier: string, division: string, lp: number): number => {
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

export const valueToRank = (value: number): { id: string, tier: string, division: string, lp: number } => {
  const tierIndex = Math.floor(value / 400);
  const remainder = value % 400;

  if (tierIndex >= LEAGUE_TIERS.length) {
    return { id: "CHALLENGER", tier: "Retador", division: "", lp: Math.min(remainder, 9999) };
  }

  const tier = LEAGUE_TIERS[tierIndex];

  if (!tier) {
    return { id: "IRON", tier: "Hierro", division: "IV", lp: 0 };
  }

  if (tier.name === "Maestro" || tier.name === "Gran Maestro" || tier.name === "Retador") {
    return { id: tier.id, tier: tier.name, division: "", lp: Math.min(remainder, 9999) };
  }

  const divisionIndex = Math.floor(remainder / 100);
  const lp = remainder % 100;
  const divisions = ["IV", "III", "II", "I"];

  return {
    id: tier.id,
    tier: tier.name,
    division: divisions[divisionIndex] || "IV",
    lp: Math.min(lp, 100)
  };
};

export const timeToAMPM = (time: string) => {
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr!, 10);
  const minute = parseInt(minuteStr!, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};
