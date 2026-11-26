import { ref, watch, onUnmounted, type Ref } from "vue";

import * as config from "../constants/config";
import { getCachedBasicColorNameByHex } from "../api/endpoints/colornames";
import type { Rgb } from "../utils/average-color";
import { colorDistance } from "../utils/color-distance";
import { quantizeColor } from "../utils/quantize-color";
import { rgbToHex } from "../utils/rgb-to-hex";

/**
 * Looks up a broad color name for the live camera color once it settles.
 *
 * The color is compared with an "anchor" color. Small changes (camera noise)
 * keep the anchor and its name. A bigger change moves the anchor, clears the
 * old name and waits for the color to settle before looking up a new one.
 */
export function useLiveColorName(color: Ref<Rgb | null>) {
  const liveColorName = ref<string | null>(null);

  let anchor: Rgb | null = null;
  let timeoutId: number | undefined;

  watch(color, (current) => {
    if (!current) {
      resetAnchor(null);
      return;
    }

    if (
      anchor &&
      colorDistance(anchor, current) <= config.LIVE_COLOR_NAME_TOLERANCE
    ) {
      return;
    }

    resetAnchor(current);
  });

  onUnmounted(() => window.clearTimeout(timeoutId));

  function resetAnchor(newAnchor: Rgb | null) {
    window.clearTimeout(timeoutId);

    anchor = newAnchor;

    // Clear the old name right away so it never shows next to a new color.
    liveColorName.value = null;

    if (!newAnchor) {
      return;
    }

    timeoutId = window.setTimeout(async () => {
      // Use the latest sample (still within tolerance of the anchor), and
      // quantize it so nearby colors share one cached request.
      const { r, g, b } = quantizeColor(color.value ?? newAnchor);
      const hex = rgbToHex(r, g, b);

      try {
        const name = await getCachedBasicColorNameByHex(hex);

        if (anchor === newAnchor) {
          liveColorName.value = name;
        }
      } catch {
        // The live name is a hint only; the shutter flow shows errors.
      }
    }, config.LIVE_COLOR_NAME_DEBOUNCE_MS);
  }

  return { liveColorName };
}
