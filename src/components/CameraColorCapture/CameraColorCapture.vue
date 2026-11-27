<template>
  <div class="flex min-h-0 w-full flex-1 flex-col items-center gap-3">
    <!-- Size container: the square viewfinder takes the largest size that fits -->
    <div
      class="flex min-h-0 w-full flex-1 items-center justify-center px-4 text-white [container-type:size]"
    >
      <!-- A white ring while frozen, so a still frame never passes for live -->
      <div
        ref="viewfinderRef"
        class="relative flex size-[min(100cqw,100cqh,500px)] items-center justify-center overflow-hidden rounded-3xl border bg-neutral-900"
        :class="
          isFrozen
            ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-black'
            : 'border-white/20'
        "
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

        <!-- Still image of the moment the user froze the view -->
        <img
          v-if="isFrozen && frozenFrameUrl"
          :src="frozenFrameUrl"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          :class="{ '-scale-x-100': props.isFrontCamera }"
        />

        <template v-if="status === 'ready' && colorHex">
          <p class="sr-only" role="status" aria-live="polite">
            {{ liveColorName }}
          </p>

          <!-- Tap to place the point, drag to move it, or use the arrow keys -->
          <div
            class="absolute inset-0 rounded-3xl outline-none [touch-action:pinch-zoom] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            tabindex="0"
            role="application"
            aria-label="Color picker point. Tap or drag to move it, or use the arrow keys."
            @pointerdown="reticle.onPointerDown"
            @pointermove="reticle.onPointerMove"
            @pointerup="reticle.onPointerUp"
            @pointercancel="reticle.onPointerCancel"
            @keydown="reticle.onKeyDown"
          />

          <div
            ref="tooltipRef"
            class="pointer-events-none absolute left-0 top-0"
            :style="tooltipStyle"
            aria-hidden="true"
          >
            <ColorTooltip
              :hex-color="colorHex"
              :placement="tooltipPlacement"
              :arrow-offset="tooltipArrowOffset"
            >
              {{ liveColorName }}
            </ColorTooltip>
          </div>

          <div
            class="pointer-events-none absolute left-0 top-0 flex h-9 w-9 items-center justify-center"
            :style="reticleStyle"
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

          <Transition name="badge">
            <p
              v-if="isFrozen"
              class="pointer-events-none absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black"
            >
              Frozen
            </p>
          </Transition>

          <p
            v-if="!hasMovedReticle"
            class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
          >
            Tap or drag to pick a spot
          </p>
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
          <p v-else-if="status === 'ready'">Reading the first color…</p>
          <p v-else>Starting camera… Allow access if your browser asks.</p>
        </div>
      </div>
    </div>

    <!-- Tools sit under the image, so the whole image stays free to pick from -->
    <div class="flex items-center justify-center gap-2">
      <button
        v-for="tool in tools"
        :key="tool.label"
        type="button"
        class="pressable inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        :class="
          tool.isPressed
            ? 'bg-white text-black'
            : 'bg-white/10 text-white hover:bg-white/20'
        "
        :aria-label="tool.ariaLabel"
        :aria-pressed="tool.isPressed"
        :disabled="tool.isDisabled"
        @click="tool.onClick"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" :d="tool.icon" />
        </svg>
        {{ tool.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { useElementSize, useObjectUrl } from "@vueuse/core";

import * as config from "../../constants/config";

import ColorTooltip from "../ColorTooltip";
import { useCamera } from "../../composables/useCamera";
import { useReticlePosition } from "../../composables/useReticlePosition";
import {
  useVideoColorSampler,
  type SampleSource,
} from "../../composables/useVideoColorSampler";
import type { Rgb } from "../../utils/average-color";
import { getColorName } from "../../utils/color-name";
import { rgbToHex } from "../../utils/rgb-to-hex";
import { createStableValue } from "../../utils/stable-value";
import { viewToSourcePoint } from "../../utils/view-to-source";
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

/** Pixels of the frozen frame, sampled while frozen */
const frozenFrame = document.createElement("canvas");

/** Image of the frozen frame, shown over the live video while frozen */
const frozenFrameBlob = shallowRef<Blob | null>(null);
const frozenFrameUrl = useObjectUrl(frozenFrameBlob);

/** Counts freezes, so an image made for an earlier freeze is dropped */
let freezeId = 0;
const viewfinderRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);

/** Viewfinder size in px, kept up to date for placing the tooltip */
const { width: viewWidth, height: viewHeight } = useElementSize(viewfinderRef);

const { status, errorMessage, startCamera } = useCamera(
  () => props.isFrontCamera,
  videoRef,
);

const reticle = useReticlePosition(viewfinderRef);

/** Whether the user ever moved the point, to stop showing the hint */
const hasMovedReticle = ref(false);

/** `true` while the user looks at a still frame instead of the live camera */
const isFrozen = ref(false);

const { color: rawColor, requestSample } = useVideoColorSampler(
  getSampleSource,
  () => status.value === "ready",
);

watch(reticle.position, () => {
  hasMovedReticle.value ||= !reticle.isCentered.value;
  requestSample();
});

watch(status, requestSample);

// A frozen frame belongs to the camera it came from
watch([status, () => props.isFrontCamera], () => {
  isFrozen.value = false;
});

// Drop the frozen image (its URL is released with it)
watch(isFrozen, (frozen) => {
  if (!frozen) {
    frozenFrameBlob.value = null;
  }
});

function getSampleSource(): SampleSource | null {
  const area = viewfinderRef.value;
  const video = videoRef.value;

  if (!area || !video) {
    return null;
  }

  let image: SampleSource["image"];
  let width: number;
  let height: number;

  if (isFrozen.value) {
    image = frozenFrame;
    width = frozenFrame.width;
    height = frozenFrame.height;
  } else {
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null;
    }

    image = video;
    width = video.videoWidth;
    height = video.videoHeight;
  }

  if (!width || !height) {
    return null;
  }

  const point = viewToSourcePoint(
    reticle.position.value,
    { width: area.clientWidth, height: area.clientHeight },
    { width, height },
    props.isFrontCamera,
  );

  return { image, width, height, point };
}

function toggleFreeze() {
  if (isFrozen.value) {
    isFrozen.value = false;
    requestSample();
    return;
  }

  const video = videoRef.value;

  if (!video || !video.videoWidth) {
    return;
  }

  frozenFrame.width = video.videoWidth;
  frozenFrame.height = video.videoHeight;
  frozenFrame.getContext("2d")?.drawImage(video, 0, 0);

  isFrozen.value = true;
  requestSample();

  const currentFreezeId = ++freezeId;

  // Shown as an <img>, which crops like the <video> in every browser
  frozenFrame.toBlob((blob) => {
    if (blob && isFrozen.value && currentFreezeId === freezeId) {
      frozenFrameBlob.value = blob;
    }
  });
}

/** Gap (px) between the point and the tooltip */
const TOOLTIP_GAP = 20;
/** Space (px) kept between the tooltip and the viewfinder's edges */
const TOOLTIP_EDGE_MARGIN = 8;

// Measured, so a longer color name still fits inside the viewfinder
const { width: tooltipWidth, height: tooltipHeight } =
  useElementSize(tooltipRef);

/** Distance (px) from the tooltip's center to the edge it must stay inside */
const tooltipHalfWidth = computed(
  () => tooltipWidth.value / 2 + TOOLTIP_EDGE_MARGIN,
);

const reticlePx = computed(() => ({
  x: reticle.position.value.x * viewWidth.value,
  y: reticle.position.value.y * viewHeight.value,
}));

const reticleStyle = computed(() => ({
  transform: `translate(${reticlePx.value.x}px, ${reticlePx.value.y}px) translate(-50%, -50%)`,
}));

const tooltipPlacement = computed(() =>
  reticlePx.value.y >= tooltipHeight.value + TOOLTIP_GAP + TOOLTIP_EDGE_MARGIN
    ? "top"
    : "bottom",
);

/** Tooltip center (px), pushed in from the edges */
const tooltipX = computed(() =>
  Math.min(
    Math.max(reticlePx.value.x, tooltipHalfWidth.value),
    Math.max(viewWidth.value - tooltipHalfWidth.value, tooltipHalfWidth.value),
  ),
);

/** Keeps the arrow on the point when the tooltip is pushed in */
const tooltipArrowOffset = computed(() => {
  // Stop before the rounded corner (12px) plus half the arrow (10px)
  const limit = Math.max(tooltipWidth.value / 2 - 22, 0);

  return Math.min(Math.max(reticlePx.value.x - tooltipX.value, -limit), limit);
});

const tooltipStyle = computed(() => {
  const shiftY =
    tooltipPlacement.value === "top"
      ? `calc(-100% - ${TOOLTIP_GAP}px)`
      : `${TOOLTIP_GAP}px`;

  return {
    transform: `translate(${tooltipX.value}px, ${reticlePx.value.y}px) translate(-50%, ${shiftY})`,
  };
});

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
    // A still frame has no noise to smooth out, so take its name right away
    liveColorName.value = stabilizeColorName(
      colorHex.value ? getColorName(colorHex.value) : null,
      isFrozen.value,
    );

    // Send the name the user sees, so a capture never names it differently
    emit("on-color-captured", colorHex.value, liveColorName.value);
  },
  { immediate: true },
);

function toggleWhiteBalance() {
  whiteReference.value = whiteReference.value ? null : rawColor.value;
}

const isReady = computed(() => status.value === "ready" && !!colorHex.value);

const ICONS = {
  pause: "M15.75 5.25v13.5m-7.5-13.5v13.5",
  sun: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z",
  center:
    "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
};

// Labels stay the same when toggled; `isPressed` (aria-pressed) carries the
// state, so a screen reader hears "Freeze, pressed" rather than a new name
const tools = computed(() => [
  {
    label: "Freeze",
    ariaLabel: undefined,
    icon: ICONS.pause,
    isPressed: isFrozen.value,
    isDisabled: !isReady.value,
    onClick: toggleFreeze,
  },
  {
    label: "Calibrate",
    ariaLabel: "Calibrate white",
    icon: ICONS.sun,
    isPressed: whiteReference.value !== null,
    isDisabled: !isReady.value,
    onClick: toggleWhiteBalance,
  },
  {
    label: "Center",
    ariaLabel: "Center the point",
    icon: ICONS.center,
    isPressed: undefined,
    isDisabled: !isReady.value || reticle.isCentered.value,
    onClick: reticle.recenter,
  },
]);
</script>

<style scoped>
/* "Frozen" badge: confirms the state change, enters a bit slower than it
   leaves so going live feels immediate */
.badge-enter-active {
  transition:
    opacity 150ms var(--ease-out),
    transform 150ms var(--ease-out);
}

.badge-leave-active {
  transition: opacity 100ms var(--ease-out);
}

.badge-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.badge-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .badge-enter-from {
    transform: none;
  }
}
</style>
