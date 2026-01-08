export default defineEventHandler(async () => {
  const info = await $fetch("/api/info");

  if (info.streak > 0) {
    return `${info.user?.gameName} tiene una racha de ${info.streak} victorias seguidas! 🔥`;
  }
  else if (info.streak < 0) {
    return `${info.user?.gameName} tiene una racha de ${-info.streak} derrotas seguidas. JU`;
  }

  return "No se pudo determinar la racha";
});
