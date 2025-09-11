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

  const body = await readValidatedBody(event, z.object({
    url: z.string().url().optional()
  }).parse);

  let blob: File | Blob;

  if (body.url) {
    blob = await $fetch(body.url, {
      responseType: "blob",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
      }
    });
  }
  else {
    const files = await readFormData(event);
    blob = files.get("file") as File;
  }

  if (!blob) {
    return createError({
      statusCode: 400,
      message: "File not found"
    });
  }

  ensureBlob(blob, {
    types: ["image"],
    maxSize: "16MB"
  });

  const uuid = randomUUID();

  return hubBlob().put(uuid, blob, {
    prefix: "gallery",
    contentType: blob.type
  });
});
