import type { Rgb } from "./average-color";

/** Euclidean distance between two colors in RGB space (0 to ~441). */
export function colorDistance(a: Rgb, b: Rgb) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}
