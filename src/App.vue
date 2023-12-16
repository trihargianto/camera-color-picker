<script setup lang="ts">
import LogoPng from "./assets/what-color-logo.png";

import CameraControl from "./components/CameraControl.vue";
</script>

<template>
  <div class="flex h-full w-full flex-col justify-center bg-black">
    <p
      class="mb-10 flex items-center justify-center text-2xl font-semibold text-white sm:text-3xl"
    >
      <img :src="LogoPng" class="mr-2 h-10 w-10" />
      Camera Color Picker
    </p>

    <CameraControl />
  </div>
</template>
