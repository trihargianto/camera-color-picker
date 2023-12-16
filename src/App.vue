<script setup lang="ts">
import LogoPng from "./assets/what-color-logo.png";
import CameraControl from "./components/CameraControl.vue";
</script>

<template>
  <div class="py-10">
    <p
      class="text-2xl sm:text-3xl font-semibold flex justify-center items-center"
    >
      <img :src="LogoPng" class="w-10 h-10 mr-2" />
      Camera Color Picker
    </p>

    <CameraControl class="my-6 sm:my-6" />

    <p class="text-sm text-center">© 2023 Tri Hargianto</p>
  </div>
</template>
