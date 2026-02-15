<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";

const pages: NavigationMenuItem[] = [
  {
    slot: "tracker" as const,
    label: "Tracker",
    as: "span",
    items: [
      {
        label: "2026",
        to: "/"
      },
      {
        label: "2025",
        to: "/season/2025"
      }
    ] satisfies DropdownMenuItem[]
  },
  {
    slot: "soloboom" as const,
    label: "SoloBoom",
    as: "span",
    items: [
      {
        label: "2025",
        to: "/season/2025/soloboom"
      }
    ] satisfies DropdownMenuItem[]
  },
  {
    slot: "retos" as const,
    label: "Retos",
    as: "span",
    items: [
      {
        label: "One by One",
        to: "/season/2026/reto-one-by-one"
      }
    ] satisfies DropdownMenuItem[]
  },
  {
    label: "Gallery",
    to: "/gallery"
  },
  {
    label: "Comunidad",
    to: "https://comunidad.jimtracker.com"
  }
];
</script>

<template>
  <div id="layout">
    <UHeader
      class="bg-white/3 backdrop-blur shadow-lg shadow-black/20"
      title="JimTracker"
      toggle-side="left"
      :ui="{
        root: 'lg:h-auto',
        container: 'lg:px-3 lg:py-2 mx-0 max-w-full',
        title: 'lg:hidden block',
        center: 'md:flex',
        right: 'hidden',
      }"
    >
      <UNavigationMenu
        :items="pages"
        color="neutral"
        :ui="{
          childList: 'grid-cols-1',
          list: 'gap-2',
          link: 'text-body data-[state=open]:hover:before:bg-white/5 hover:before:bg-white/5 before:border before:border-white/10 font-semibold px-3 before:rounded before:transition-colors before:duration-200',
          item: 'py-0',
        }"
      >
        <template
          v-for="page in pages.filter((p) => p.slot)"
          :key="page.slot"
          #[page.slot!]="{ item }: { item: NavigationMenuItem & { items?: DropdownMenuItem[] } }"
        >
          <UDropdownMenu :content="item.content" :items="item.items" :modal="false">
            <UButton :label="item.label" color="neutral" variant="link" trailing-icon="lucide:chevron-down" class="text-body p-0" />
          </UDropdownMenu>
        </template>
      </UNavigationMenu>
      <template #body>
        <UNavigationMenu
          :items="pages.map(page => ({ ...page, children: page.items }))"
          color="neutral"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>
    <div class="relative">
      <img class="absolute top-0 start-0 w-40 md:w-60 p-2 pointer-events-none select-none -z-1" src="/images/corner.png">
      <img class="absolute top-0 end-0 w-40 md:w-60 p-2 rotate-y-180 pointer-events-none select-none -z-1" src="/images/corner.png">
      <div class="lg:container mx-auto py-5 px-2">
        <slot />
      </div>
    </div>
    <footer class="text-center text-sm text-slate-300 py-4">
      <span>
        <NuxtLink href="https://github.com/ahmedrangel/jimtracker" target="_blank" class="text-emerald-300 font-semibold hover:underline">Creado</NuxtLink>
        con ❤️ por
        <NuxtLink href="https://github.com/ahmedrangel" target="_blank" class="text-emerald-300 font-semibold hover:underline">Ahmed Rangel</NuxtLink>
      </span>
    </footer>
  </div>
</template>
