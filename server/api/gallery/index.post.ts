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

  const contentType = getHeader(event, "content-type") || "";
  let blobFile: File | Blob;

  if (contentType.includes("application/json")) {
    const body = await readValidatedBody(event, z.object({
      url: z.string().url()
    }).parse);
    blobFile = await $fetch<Blob>(body.url, { responseType: "blob" });
  }
  else if (contentType.includes("multipart/form-data")) {
    const files = await readFormData(event);
    blobFile = files.get("file") as File;
  }
  else {
    return createError({
      statusCode: 400,
      message: "Content type must be application/json or multipart/form-data"
    });
  }

  if (!blobFile) {
    return createError({
      statusCode: 400,
      message: "File not found"
    });
  }

  ensureBlob(blobFile, {
    types: ["image"],
    maxSize: "16MB"
  });

  const uuid = randomUUID();

  return blob.put(uuid, blobFile, {
    prefix: "gallery",
    contentType: blobFile.type
  });
});
