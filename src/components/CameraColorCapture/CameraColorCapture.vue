<template>
  <div
    class="flex w-full flex-col items-center justify-center px-6 text-white sm:w-[500px]"
  >
    <canvas ref="canvasRef" class="hidden" />

    <div
      class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border"
    >
      <video
        ref="videoRef"
        autoplay
        playsinline
        class="z-2 absolute rounded-2xl"
      />

      <template v-if="isCameraShown">
        <div
          class="absolute flex h-9 w-9 items-center justify-center rounded-md"
        >
          <div
            class="absolute h-3 w-3 rounded-full"
            :style="`background-color: rgb(${capturedColor.r},${capturedColor.g},${capturedColor.b});`"
          ></div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="2 2 20 20"
            stroke="currentColor"
            class="absolute h-full w-full"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </template>
      <p v-else class="absolute">
        <template v-if="config.IS_CAMERA_ENABLED">
          Initializing camera...
        </template>
        <template v-else>Camera is disabled</template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import * as config from "../../constants/config";
import { useCamera } from "../../composables/useCamera";
import { useCanvasColorCapture } from "../../composables/useCanvasColorCapture";

defineOptions({
  name: "CameraColorCapture",
});

const props = defineProps({
  /** Set to `true` to use the front camera */
  isFrontCamera: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  /**
   * Emitted every time a new color is captured from the camera
   */
  "on-color-captured",
]);

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { capturedImage, isCameraShown, restartCamera } = useCamera(
  props.isFrontCamera,
  videoRef,
);

const { capturedColor } = useCanvasColorCapture(capturedImage, canvasRef, emit);

watch(() => props.isFrontCamera, restartCamera);
</script>
