<template>
  <!-- Size container: the square viewfinder takes the largest size that fits -->
  <div
    class="flex min-h-0 w-full flex-1 items-center justify-center px-4 text-white [container-type:size]"
  >
    <div
      ref="viewfinderRef"
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

        <button
          type="button"
          class="pressable absolute left-2 top-2 min-h-11 rounded-full px-4 text-sm font-semibold backdrop-blur-sm"
          :class="isFrozen ? 'bg-white text-black' : 'bg-black/60 text-white'"
          :aria-pressed="isFrozen"
          @click="toggleFreeze()"
        >
          {{ isFrozen ? "Go live" : "Freeze" }}
        </button>

        <button
          type="button"
          class="pressable absolute right-2 top-2 min-h-11 rounded-full bg-black/60 px-4 text-sm font-semibold text-white backdrop-blur-sm"
          :aria-pressed="whiteReference !== null"
          @click="toggleWhiteBalance()"
        >
          {{ whiteReference ? "Reset white" : "Calibrate white" }}
        </button>

        <button
          v-if="!reticle.isCentered.value"
          type="button"
          class="pressable absolute bottom-2 left-1/2 min-h-11 -translate-x-1/2 rounded-full bg-black/60 px-4 text-sm font-semibold text-white backdrop-blur-sm"
          @click="reticle.recenter()"
        >
          Center point
        </button>
        <p
          v-else-if="!hasMovedReticle"
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
        <p v-else>Initializing camera...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

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
const frozenFrameUrl = ref<string | null>(null);

/** Counts freezes, so an image made for an earlier freeze is dropped */
let freezeId = 0;
const viewfinderRef = ref<HTMLElement | null>(null);

/** Viewfinder size in px, kept up to date for placing the tooltip */
const viewSize = ref({ width: 0, height: 0 });
let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  resizeObserver = new ResizeObserver(([entry]) => {
    viewSize.value = {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    };
  });

  if (viewfinderRef.value) {
    resizeObserver.observe(viewfinderRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  setFrozenFrameUrl(null);
});

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

// A frozen frame belongs to the camera it came from
watch([status, () => props.isFrontCamera], () => {
  isFrozen.value = false;
});

watch(isFrozen, (frozen) => {
  if (!frozen) {
    setFrozenFrameUrl(null);
  }
});

function setFrozenFrameUrl(url: string | null) {
  if (frozenFrameUrl.value) {
    URL.revokeObjectURL(frozenFrameUrl.value);
  }

  frozenFrameUrl.value = url;
}

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
      setFrozenFrameUrl(URL.createObjectURL(blob));
    }
  });
}

/** Half the tooltip's width (px), to keep it inside the viewfinder */
const TOOLTIP_HALF_WIDTH = 80;
/** Room (px) the tooltip needs above the point before it flips below */
const TOOLTIP_ROOM_ABOVE = 132;
/** Gap (px) between the point and the tooltip */
const TOOLTIP_GAP = 20;

const reticlePx = computed(() => ({
  x: reticle.position.value.x * viewSize.value.width,
  y: reticle.position.value.y * viewSize.value.height,
}));

const reticleStyle = computed(() => ({
  transform: `translate(${reticlePx.value.x}px, ${reticlePx.value.y}px) translate(-50%, -50%)`,
}));

const tooltipPlacement = computed(() =>
  reticlePx.value.y >= TOOLTIP_ROOM_ABOVE ? "top" : "bottom",
);

/** Tooltip center (px), pushed in from the edges */
const tooltipX = computed(() =>
  Math.min(
    Math.max(reticlePx.value.x, TOOLTIP_HALF_WIDTH),
    Math.max(viewSize.value.width - TOOLTIP_HALF_WIDTH, TOOLTIP_HALF_WIDTH),
  ),
);

/** Keeps the arrow on the point when the tooltip is pushed in */
const tooltipArrowOffset = computed(() => {
  const limit = TOOLTIP_HALF_WIDTH - 24;

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
</script>
