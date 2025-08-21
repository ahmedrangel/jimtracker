<script setup lang="ts">
const { data } = await useFetch<InfoResponse>("https://jimtracker.pages.dev/api/info");
</script>

<template>
  <main>
    <div class="flex items-center justify-center">
      <div class="mb-5 p-4 bg-red-800 rounded aspect-square flex items-center justify-center w-30 h-30 md:w-36 md:h-36">
        <img src="/images/jimrsng.png" class="max-w-full max-h-full object-contain">
      </div>
    </div>
    <UserStats :user="data?.user" :highest="data?.highest" :lowest="data?.lowest" />
    <EloChart :history="data?.history" />
  </main>
</template>
