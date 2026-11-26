import { converter } from "./culori";
import type { Rgb } from "./average-color";

const toLinearRgb = converter("lrgb");
const toRgb = converter("rgb");

// Limit the correction so a bad reference (very dark or very colorful)
// cannot push colors to extremes.
const MIN_GAIN = 0.5;
const MAX_GAIN = 2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function toLinear({ r, g, b }: Rgb) {
  return toLinearRgb({ mode: "rgb", r: r / 255, g: g / 255, b: b / 255 });
}

/**
 * Correct `color` for the light in the scene, using `whiteReference`: a sample
 * of something that should be white or gray (e.g. paper) under the same light.
 *
 * Each channel is scaled so the reference becomes neutral gray. This is done
 * in linear RGB, where light mixes the way it does in the real world.
 */
export function applyWhiteBalance(color: Rgb, whiteReference: Rgb): Rgb {
  const reference = toLinear(whiteReference);
  const gray = (reference.r + reference.g + reference.b) / 3;

  const gain = (channel: number) =>
    channel > 0 ? clamp(gray / channel, MIN_GAIN, MAX_GAIN) : 1;

  const linear = toLinear(color);

  const corrected = toRgb({
    mode: "lrgb",
    r: linear.r * gain(reference.r),
    g: linear.g * gain(reference.g),
    b: linear.b * gain(reference.b),
  });

  const to255 = (value: number) => Math.round(clamp(value, 0, 1) * 255);

  return {
    r: to255(corrected.r),
    g: to255(corrected.g),
    b: to255(corrected.b),
  };
}
