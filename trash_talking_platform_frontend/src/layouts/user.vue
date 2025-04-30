<template>
  <main>
    <navbar />
    <slot />
    <!-- <endBar /> -->
  </main>
</template>

<script setup lang="ts">
import navbar from "../components/navbar.vue";
//   import endBar from "@/components/footer.vue";
</script>

<style scoped></style>
