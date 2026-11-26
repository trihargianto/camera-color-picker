import type { Rgb } from "./average-color";

/**
 * Snap each channel to a coarse step so tiny camera noise maps to the same value.
 * Used for the live color name, where a broad name is enough.
 */
export function quantizeColor({ r, g, b }: Rgb, step = 16): Rgb {
  const snap = (value: number) =>
    Math.min(255, Math.round(value / step) * step);

  return { r: snap(r), g: snap(g), b: snap(b) };
}
