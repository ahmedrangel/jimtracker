export default defineEventHandler(async () => {
  const soloboom = await $fetch("/api/soloboom");

  return soloboom?.rank;
});
