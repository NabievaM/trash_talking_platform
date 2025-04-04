<template>
  <v-app>
    <component :is="route.meta.layoutComponent">
      <slot />
    </component>
  </v-app>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<style lang="scss" scoped></style>
