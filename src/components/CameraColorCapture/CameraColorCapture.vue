<template>
  <div
    class="flex w-full flex-col items-center justify-center px-6 text-white sm:w-[500px]"
  >
    <div
      class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border"
    >
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        aria-hidden="true"
        class="absolute inset-0 h-full w-full object-cover"
        :class="{ '-scale-x-100': props.isFrontCamera }"
      />

      <template v-if="status === 'ready' && colorHex">
        <p class="sr-only" role="status" aria-live="polite">
          {{ liveColorName }}
        </p>

        <div
          class="absolute bottom-1/2 mb-6 flex justify-center"
          aria-hidden="true"
        >
          <ColorTooltip :hex-color="colorHex">
            {{ liveColorName ?? "…" }}
          </ColorTooltip>
        </div>

        <div
          class="absolute flex h-9 w-9 items-center justify-center rounded-md"
          aria-hidden="true"
        >
          <div
            class="absolute h-3 w-3 rounded-full border border-white"
            :style="{ backgroundColor: `#${colorHex}` }"
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="2 2 20 20"
            stroke="currentColor"
            class="absolute h-full w-full drop-shadow"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5"
            />
          </svg>
        </div>
      </template>

      <div
        v-else
        class="absolute flex flex-col items-center gap-3 px-6 text-center"
        role="status"
      >
        <p v-if="status === 'disabled'">Camera is disabled</p>
        <template v-else-if="status === 'error'">
          <p>{{ errorMessage }}</p>
          <button
            type="button"
            class="rounded-md bg-white px-4 py-2 font-semibold text-black"
            @click="startCamera()"
          >
            Try again
          </button>
        </template>
        <p v-else>Initializing camera...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import ColorTooltip from "../ColorTooltip";
import { useCamera } from "../../composables/useCamera";
import { useVideoColorSampler } from "../../composables/useVideoColorSampler";
import { useLiveColorName } from "../../composables/useLiveColorName";

defineOptions({
  name: "CameraColorCapture",
});

const props = withDefaults(
  defineProps<{
    /** Set to `true` to use the front camera */
    isFrontCamera?: boolean;
  }>(),
  { isFrontCamera: false },
);

const emit = defineEmits<{
  /** Emitted every time the color under the reticle changes (`null` when unavailable) */
  "on-color-captured": [colorHex: string | null];
}>();

const videoRef = ref<HTMLVideoElement | null>(null);

const { status, errorMessage, startCamera } = useCamera(
  () => props.isFrontCamera,
  videoRef,
);

const { color, colorHex } = useVideoColorSampler(
  videoRef,
  () => status.value === "ready",
);

const { liveColorName } = useLiveColorName(color);

watch(colorHex, (hex) => emit("on-color-captured", hex));
</script>
