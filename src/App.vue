<script setup lang="ts">
import LogoPng from "./assets/what-color-logo.png";

import CameraControl from "./components/CameraControl.vue";
</script>

<template>
  <div class="py-10">
    <p
      class="text-2xl sm:text-3xl font-semibold flex justify-center items-center mb-8"
    >
      <img :src="LogoPng" class="w-10 h-10 mr-2" />
      Camera Color Picker
    </p>

    <CameraControl />

    <div class="mt-20 text-sm sm:text-base">
      <p class="text-center">
        © 2023 Made by
        <a href="https://trihargianto.com" class="hover:underline">
          Tri Hargianto
        </a>
      </p>

      <div class="flex justify-center mt-3 gap-4">
        <p class="inline-flex gap-2">
          <a
            href="https://github.com/trihargianto/camera-color-picker"
            class="hover:underline"
          >
            Github
          </a>
          <img src="/static/github-mark.svg" width="24" height="24" />
        </p>
        <p class="inline-flex gap-2">
          <a href="https://vuejs.org/" class="hover:underline"> Vuejs </a>
          <img src="/static/vuejs.svg" width="24" height="24" />
        </p>
        <p class="inline-flex gap-2">
          <a href="https://vercel.com/" class="hover:underline"> Vercel </a>
          <img src="/static/vercel.svg" width="24" height="24" />
        </p>
      </div>
    </div>
  </div>
</template>
