export default defineEventHandler(async (event) => {
  console.info("H3Event", event);
  return { message: "Hello World!" };
});
