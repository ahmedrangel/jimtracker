<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();
</script>

<template>
  <div class="w-screen h-screen flex justify-center items-center bg-neutral-400 dark:bg-neutral-950 text-lg">
    <div class="p-5 shadow bg-neutral-100 dark:bg-neutral-800 rounded">
      <h1>Error <span class="text-primary">{{ error.status }}</span></h1>
      <h5>{{ "error_occurred" }}: {{ error.message || error.statusText || "error" }}</h5>
      <p>{{ "go_back" }}: <NuxtLink to="/" class="underline">link</NuxtLink></p>
    </div>
  </div>
</template>
