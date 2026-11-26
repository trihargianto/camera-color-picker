import { ref, computed, onMounted, onUnmounted, type Ref } from "vue";

import * as config from "../constants/config";
import { averageColor, type Rgb } from "../utils/average-color";
import { rgbToHex } from "../utils/rgb-to-hex";

/**
 * Samples the average color of a small square at the center of a playing video.
 */
export function useVideoColorSampler(
  videoRef: Ref<HTMLVideoElement | null>,
  isEnabled: () => boolean,
) {
  const color = ref<Rgb | null>(null);

  const colorHex = computed(() => {
    if (!color.value) {
      return null;
    }

    const { r, g, b } = color.value;

    return rgbToHex(r, g, b);
  });

  const size = config.COLOR_SAMPLE_SIZE;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  let intervalId: number | undefined;

  onMounted(() => {
    intervalId = window.setInterval(
      sampleColor,
      config.COLOR_SAMPLE_INTERVAL_MS,
    );
  });

  onUnmounted(() => {
    window.clearInterval(intervalId);
  });

  function sampleColor() {
    const video = videoRef.value;

    if (!isEnabled()) {
      color.value = null;
      return;
    }

    if (
      !video ||
      !context ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      video.videoWidth === 0
    ) {
      return;
    }

    const sourceX = Math.max(0, Math.floor(video.videoWidth / 2 - size / 2));
    const sourceY = Math.max(0, Math.floor(video.videoHeight / 2 - size / 2));

    try {
      context.drawImage(video, sourceX, sourceY, size, size, 0, 0, size, size);

      color.value = averageColor(context.getImageData(0, 0, size, size).data);
    } catch (error) {
      console.error("sampleColor() error: ", error);
    }
  }

  return { color, colorHex };
}
