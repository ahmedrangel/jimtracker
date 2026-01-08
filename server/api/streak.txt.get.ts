export default defineEventHandler(async () => {
  const info = await $fetch("/api/info");

  if (info.streak > 0) {
    const streakText = info.streak === 1 ? "victoria" : "victorias seguidas";
    return `${info.user?.gameName} tiene una racha de ${info.streak} ${streakText}! 🔥`;
  }
  if (info.streak < 0) {
    const streakText = info.streak === -1 ? "derrota" : "derrotas seguidas";
    return `${info.user?.gameName} tiene una racha de ${-info.streak} ${streakText}. JU`;
  }

  return "No se pudo determinar la racha";
});
