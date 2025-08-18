<script setup lang="ts">
const { options } = useRouter();
options.scrollBehavior = (to) => {
  if (!to.hash) return { left: 0, top: 0 };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ el: to.hash, top: 55, left: 0, behavior: "smooth" });
    }, 500);
  });
};
</script>

<template>
  <div>
    <NuxtLoadingIndicator :throttle="0" />
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>
