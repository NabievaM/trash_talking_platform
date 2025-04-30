<template>
  <div class="w-full min-h-screen flex justify-center bg-gray-100">
    <main class="w-full max-w-[430px] min-h-screen bg-[#F1F4F5]">
      <component :is="route.meta.layoutComponent">
        <slot />
      </component>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<style scoped></style>
