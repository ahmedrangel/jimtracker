<script setup lang="ts">
const { data: images } = await useFetch("/api/gallery", {
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
});

const open = (link: string) => window.open(link, "_blank");
</script>

<template>
  <div class="columns-2 gap-4 sm:columns-3 md:columns-5 sm:gap-8">
    <img
      v-for="(id, index) of images"
      :key="index"
      :src="`${SITE.cdn}/gallery/${id}`"
      class="rounded-lg mb-4 cursor-pointer scale-on-hover"
      @click="open(`${SITE.cdn}/gallery/${id}`)"
    >
  </div>
</template>
