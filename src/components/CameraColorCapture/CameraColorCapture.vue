<template>
  <!-- Size container: the square viewfinder takes the largest size that fits -->
  <div
    class="flex min-h-0 w-full flex-1 items-center justify-center px-4 text-white [container-type:size]"
  >
    <div
      class="relative flex size-[min(100cqw,100cqh,500px)] items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-neutral-900"
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
            {{ liveColorName }}
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

        <button
          type="button"
          class="pressable absolute right-2 top-2 min-h-11 rounded-full bg-black/60 px-4 text-sm font-semibold text-white backdrop-blur-sm"
          :aria-pressed="whiteReference !== null"
          @click="toggleWhiteBalance()"
        >
          {{ whiteReference ? "Reset white" : "Calibrate white" }}
        </button>
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
            class="pressable min-h-11 rounded-full bg-white px-5 font-semibold text-black"
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
import { computed, ref, watch } from "vue";

import * as config from "../../constants/config";

import ColorTooltip from "../ColorTooltip";
import { useCamera } from "../../composables/useCamera";
import { useVideoColorSampler } from "../../composables/useVideoColorSampler";
import type { Rgb } from "../../utils/average-color";
import { getColorName } from "../../utils/color-name";
import { rgbToHex } from "../../utils/rgb-to-hex";
import { createStableValue } from "../../utils/stable-value";
import { applyWhiteBalance } from "../../utils/white-balance";

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
  /**
   * Emitted on every sample with the color under the reticle, after white
   * balance correction, and the name shown for it (`null` when unavailable)
   */
  "on-color-captured": [colorHex: string | null, colorName: string | null];
}>();

const videoRef = ref<HTMLVideoElement | null>(null);

const { status, errorMessage, startCamera } = useCamera(
  () => props.isFrontCamera,
  videoRef,
);

const { color: rawColor } = useVideoColorSampler(
  videoRef,
  () => status.value === "ready",
);

/**
 * A sample of something white or gray, taken when the user taps
 * "Calibrate white". Used to cancel out the color of the light in the room.
 */
const whiteReference = ref<Rgb | null>(null);

const color = computed(() => {
  if (!rawColor.value || !whiteReference.value) {
    return rawColor.value;
  }

  return applyWhiteBalance(rawColor.value, whiteReference.value);
});

const colorHex = computed(() => {
  if (!color.value) {
    return null;
  }

  const { r, g, b } = color.value;

  return rgbToHex(r, g, b);
});

const stabilizeColorName = createStableValue<string>(
  config.COLOR_NAME_STABLE_SAMPLES,
);

/**
 * Name of the color under the reticle. It only changes once a few samples in
 * a row agree, so it does not flicker between neighbors like "Red" and
 * "Orange". Watches every sample, not just hex changes, so repeats count.
 */
const liveColorName = ref<string | null>(null);

watch(
  color,
  () => {
    liveColorName.value = stabilizeColorName(
      colorHex.value ? getColorName(colorHex.value) : null,
    );

    // Send the name the user sees, so a capture never names it differently
    emit("on-color-captured", colorHex.value, liveColorName.value);
  },
  { immediate: true },
);

function toggleWhiteBalance() {
  whiteReference.value = whiteReference.value ? null : rawColor.value;
}
</script>
