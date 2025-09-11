export default defineCachedEventHandler(async () => {
  const images = await hubBlob().list({ prefix: "gallery" });

  return images.blobs.sort((a, b) => {
    return a.uploadedAt.getTime() - b.uploadedAt.getTime();
  }).map(images => images.pathname.split("gallery/")[1]);
}, {
  swr: false,
  maxAge: 86400, // 1 day
  group: "api",
  name: "gallery",
  getKey: () => "all"
});
