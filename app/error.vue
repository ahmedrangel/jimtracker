<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();
</script>

<template>
  <div class="w-[100vw] h-[100vh] flex justify-center items-center bg-neutral-400 text-lg">
    <div class="p-5 shadow bg-neutral-100 rounded">
      <h1>Error <span class="text-primary">{{ error.statusCode }}</span></h1>
      <h5>{{ "error_occurred" }}: {{ error.message || error.statusMessage }}</h5>
      <p>{{ "go_back" }}: <NuxtLink to="/" class="underline">link</NuxtLink></p>
    </div>
  </div>
</template>
