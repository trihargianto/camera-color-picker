<script setup lang="ts">
import LogoPng from "./assets/what-color-logo.png";

import CameraControl from "./components/CameraControl.vue";
</script>

<template>
  <div class="py-10">
    <p
      class="mb-8 flex items-center justify-center text-2xl font-semibold sm:text-3xl"
    >
      <img :src="LogoPng" class="mr-2 h-10 w-10" />
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

      <div class="mt-3 flex justify-center gap-4">
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
