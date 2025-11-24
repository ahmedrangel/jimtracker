<script setup lang="ts">
const { data: images } = await useFetch("/api/gallery", {
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
});

const showModal = ref(false);
const openImageId = ref<string | null>(null);
</script>

<template>
  <main>
    <UModal v-model:open="showModal">
      <div class="columns-2 gap-4 sm:columns-3 md:columns-5 sm:gap-8">
        <img
          v-for="(id, index) of images"
          :key="index"
          label="Open"
          :src="`${SITE.cdn}/gallery/${id}`"
          class="rounded-lg mb-4 cursor-pointer scale-on-hover"
          @click="openImageId = id;"
        >
      </div>
      <template #content>
        <div v-if="openImageId" class="relative">
          <img :src="`${SITE.cdn}/gallery/${openImageId}`" class="rounded-lg max-h-[90vh] max-w-[90vw] sm:min-w-[600px] md:min-w-[700px]">
          <Icon name="tabler:x" class="absolute top-2 end-2 w-8 h-8 text-neutral-200 hover:text-neutral-300 bg-rose-700/70 hover:bg-rose-700 border border-rose-800 rounded p-1.5 shadow" @click="openImageId = null; showModal = false;" />
        </div>
      </template>
    </UModal>
  </main>
</template>
