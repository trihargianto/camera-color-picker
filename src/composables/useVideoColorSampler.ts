import { ref, onUnmounted } from "vue";
import { useIntervalFn } from "@vueuse/core";

import * as config from "../constants/config";
import { averageColor, type Rgb } from "../utils/average-color";
import type { Point } from "../utils/view-to-source";

/** An image to sample and the pixel (in that image) to sample around. */
export type SampleSource = {
  image: CanvasImageSource;
  width: number;
  height: number;
  point: Point;
};

/**
 * Samples the average color of a small square of an image, like a playing
 * video or a frozen frame. Samples on an interval, and on demand through
 * `requestSample` (for example while the user drags the sample point).
 *
 * `getSource` returns `null` when nothing can be sampled yet; the last color
 * is kept. `isEnabled` returning `false` clears the color.
 */
export function useVideoColorSampler(
  getSource: () => SampleSource | null,
  isEnabled: () => boolean,
) {
  const color = ref<Rgb | null>(null);

  const size = config.COLOR_SAMPLE_SIZE;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  let frameId: number | undefined;

  useIntervalFn(sampleColor, config.COLOR_SAMPLE_INTERVAL_MS);

  onUnmounted(() => {
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
    }
  });

  /** Sample on the next frame. Several calls in one frame sample once. */
  function requestSample() {
    if (frameId !== undefined) {
      return;
    }

    frameId = requestAnimationFrame(() => {
      frameId = undefined;
      sampleColor();
    });
  }

  function sampleColor() {
    if (!isEnabled()) {
      color.value = null;
      return;
    }

    const source = getSource();

    if (!source || !context || source.width < size || source.height < size) {
      return;
    }

    // Keep the whole square inside the image
    const sourceX = clamp(
      Math.round(source.point.x - size / 2),
      0,
      source.width - size,
    );
    const sourceY = clamp(
      Math.round(source.point.y - size / 2),
      0,
      source.height - size,
    );

    try {
      context.drawImage(
        source.image,
        sourceX,
        sourceY,
        size,
        size,
        0,
        0,
        size,
        size,
      );

      color.value = averageColor(context.getImageData(0, 0, size, size).data);
    } catch (error) {
      console.error("sampleColor() error: ", error);
    }
  }

  return { color, requestSample };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
