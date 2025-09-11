export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({
    statusCode: 404,
    message: "Not found"
  });
  const { pathname } = getRouterParams(event);

  // cache when https://github.com/nitrojs/nitro/issues/2932 is solved
  return hubBlob().serve(event, pathname!);
});
