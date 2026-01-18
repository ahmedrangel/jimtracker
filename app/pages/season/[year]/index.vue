<script setup lang="ts">
const { params } = useRoute("season-year");
</script>

<template>
  <TrackerInfo :year="Number(params.year)" />
</template>
