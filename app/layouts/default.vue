<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
import { useTimeAgoIntl } from "@vueuse/core";

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
      },
      {
        label: "Reto Nami",
        to: "/season/2026/reto-nami"
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

const config = useRuntimeConfig();
const buildInfo = config.public.buildInfo;
const timeAgo = useTimeAgoIntl(buildInfo.time, {
  locale: "es",
  relativeTimeFormatOptions: {
    style: "long"
  }
});
</script>

<template>
  <div id="layout">
    <UHeader
      class="border-0 backdrop-blur-sm border-b border-default/75 bg-elevated/20 shadow-sm"
      title="JimTracker"
      toggle-side="left"
      :ui="{
        root: 'lg:h-auto relative',
        container: 'lg:px-3 lg:py-1 mx-0 max-w-full',
        title: 'lg:hidden block',
        center: 'md:flex',
        right: 'hidden',
      }"
    >
      <UNavigationMenu
        :items="pages"
        color="neutral"
        :ui="{
          list: 'gap-2',
          link: 'text-md hover:before:bg-accented/50 data-active:before:bg-accented/75 before:border before:border-accented/50 before:bg-elevated/20 p-0',
        }"
      >
        <template #item="{ item }">
          <span class="text-md px-3 py-1 w-full h-full">{{ item.label }}</span>
        </template>
        <template
          v-for="page in pages.filter((p) => p.slot)"
          :key="page.slot"
          #[page.slot!]="{ item }: { item: NavigationMenuItem & { items?: DropdownMenuItem[] } }"
        >
          <UDropdownMenu :content="item.content" :items="item.items" :modal="false">
            <UButton
              :label="item.label"
              trailing-icon="lucide:chevron-down"
              variant="link"
              color="neutral"
              :ui="{
                base: 'text-md px-3 py-1 w-full h-full',
              }"
            />
          </UDropdownMenu>
        </template>
      </UNavigationMenu>
      <template #body>
        <UNavigationMenu
          :items="pages.map(page => ({ ...page, children: page.items }))"
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
  <UFooter class="border-t border-default">
    <template #left>
      <div class="flex flex-col gap-2 lg:gap-1 lg:text-left text-center">
        <div class="flex flex-col lg:flex-row items-center gap-2">
          <p class="text-sm">{{ SITE.name }} © {{ new Date().getFullYear() }}</p>
          <UPopover mode="hover" :content="{ side: 'top' }" arrow>
            <NuxtLink :to="`${SITE.github.repository}/commit/${buildInfo.commit}`" target="_blank">
              <UBadge
                color="neutral"
                variant="subtle"
                class="flex hover:text-highlighted hover:underline text-muted"
              >
                <span class="font-mono">Build {{ buildInfo.shortCommit }}</span>
              </UBadge>
            </NuxtLink>
            <template #content>
              <p>{{ timeAgo }}</p>
            </template>
          </UPopover>
        </div>
        <p class="text-muted text-sm max-w-150 lg:max-w-full">
          JimTracker no está respaldado por Riot Games y no refleja las opiniones o puntos de vista de Riot Games ni de nadie involucrado oficialmente en la producción o gestión de League of Legends.
        </p>
      </div>
    </template>
    <template #center />
    <span class="text-sm">
      <NuxtLink :to="SITE.github.repository" target="_blank" class="dark:text-blue-300 light:text-blue-500 font-semibold hover:underline">Creado</NuxtLink>
      con ❤️ por
      <NuxtLink :to="SITE.github.authors.ahmed.url" target="_blank" class="dark:text-emerald-300 light:text-emerald-600 font-semibold hover:underline">
        {{ SITE.github.authors.ahmed.name }}
      </NuxtLink>
      y
      <NuxtLink :to="SITE.github.authors.yizack.url" target="_blank" class="dark:text-yellow-300 light:text-yellow-600 font-semibold hover:underline">
        {{ SITE.github.authors.yizack.name }}
      </NuxtLink>
    </span>
    <template #right>
      <NuxtLink :to="SITE.github.repository" target="_blank" class="hover:text-highlighted">
        <Icon name="simple-icons:github" size="2rem" />
      </NuxtLink>
    </template>
  </UFooter>
  </div>
</template>
