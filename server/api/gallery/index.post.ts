import { randomUUID } from "node:crypto";

export default defineEventHandler(async (event) => {
  const token = getHeader(event, "x-cdn-token");
  const config = useRuntimeConfig(event);

  if (token !== config.cdnToken) {
    return createError({
      statusCode: 401,
      message: "Invalid or missing CDN token"
    });
  }

  const files = await readFormData(event);
  const file = files.get("file") as File;

  if (!file) {
    return createError({
      statusCode: 400,
      message: "File not found"
    });
  }

  ensureBlob(file, {
    types: ["image"],
    maxSize: "16MB"
  });

  const uuid = randomUUID();

  return hubBlob().put(uuid, file, {
    prefix: "gallery",
    contentType: file.type
  });
});
