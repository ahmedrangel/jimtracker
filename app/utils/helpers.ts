// Helpers
export const LEAGUE_TIERS = [
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

export const valueToRank = (value: number): { tier: string, division: string, lp: number } => {
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
