<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

defineProps<{
  value: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}>();

const { copy, copied } = useClipboard();

const emit = defineEmits<{
  copy: [];
}>();

watch(copied, (bool) => {
  if (!bool) return;
  emit("copy");
});
</script>

<template>
  <UTooltip text="Copy to clipboard" :content="{ side: tooltipSide || 'top' }">
    <UButton
      :color="copied ? 'success' : 'neutral'"
      variant="link"
      :icon="copied ? 'lucide:copy-check' : 'lucide:copy'"
      aria-label="Copy to clipboard"
      @click="copy(value)"
    />
  </UTooltip>
</template>
