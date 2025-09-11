<template>
  <div id="layout">
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
