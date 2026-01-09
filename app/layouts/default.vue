<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const trackers: DropdownMenuItem[] = [
  {
    label: "2026",
    to: "/"
  },
  {
    label: "2025",
    to: "/season/2025"
  }
];

const solobooms: DropdownMenuItem[] = [
  {
    label: "2025",
    to: "/season/2025/soloboom"
  }
];
</script>

<template>
  <div id="layout">
    <nav class="flex items-center rounded justify-between bg-white/3 backdrop-blur px-3 py-2 border border-white/5 shadow-lg shadow-black/20">
      <div />
      <div class="flex items-center gap-2">
        <UDropdownMenu :items="trackers" :modal="false">
          <UButton label="Tracker" color="neutral" variant="outline" icon="i-lucide-menu" />
        </UDropdownMenu>
        <UDropdownMenu :items="solobooms" :modal="false">
          <UButton label="SoloBoom" color="neutral" variant="outline" icon="i-lucide-menu" />
        </UDropdownMenu>
        <NuxtLink to="/gallery" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200">Gallery</NuxtLink>
      </div>
    </nav>
    <div class="lg:container mx-auto py-5 px-2">
      <slot />
      <footer class="text-center text-sm text-slate-300">
        <span>
          <NuxtLink href="https://github.com/ahmedrangel/jimtracker" target="_blank" external class="text-emerald-300 font-semibold hover:underline">Creado</NuxtLink>
          con ❤️ por
          <NuxtLink href="https://github.com/ahmedrangel" target="_blank" external class="text-emerald-300 font-semibold hover:underline">Ahmed Rangel</NuxtLink>
        </span>
      </footer>
    </div>
  </div>
</template>
