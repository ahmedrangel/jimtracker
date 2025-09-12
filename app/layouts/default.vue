<template>
  <div id="layout">
    <nav class="flex md:fixed md:end-0 items-center rounded md:me-4 md:mt-4 justify-between bg-white/3 backdrop-blur px-6 py-2 border border-white/5 shadow-lg shadow-black/20">
      <div />
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200">Tracker</NuxtLink>
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
