<script setup lang="ts">
import { withQuery } from "ufo";

const { data: images } = await useFetch("/api/gallery", {
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
});

const showModal = ref(false);
const openImageId = ref<string | null>(null);

const { query } = useRoute();
const { img } = query as { img?: string };

if (img) {
  openImageId.value = img;
  showModal.value = true;
}

const galleryURL = computed(() => window ? withQuery(`${window.location.origin}/gallery`, { img: openImageId.value }) : "");
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
          <img :src="`${SITE.cdn}/gallery/${openImageId}`" class="rounded-lg max-h-[90vh] max-w-[90vw] sm:min-w-150 md:min-w-175">
          <Icon name="lucide:x" class="absolute top-2 right-2 w-8 h-8 text-neutral-200 hover:text-neutral-300 bg-rose-700/60 hover:bg-rose-700/90 border border-rose-800/90 rounded p-1.5 shadow transition-all duratino-300 ease-in-out" @click="openImageId = null; showModal = false;" />
        </div>
        <UInput :value="galleryURL" class="w-full font-mono" :ui="{ trailing: 'pr-0.5' }" readonly>
          <template #trailing>
            <CopyButton :value="galleryURL" />
          </template>
        </UInput>
      </template>
    </UModal>
  </main>
</template>
