/** Set `VITE_CAMERA_ENABLED=false` to run the app without asking for camera access. */
export const IS_CAMERA_ENABLED =
  import.meta.env.VITE_CAMERA_ENABLED !== "false";

/** How often the color under the reticle is sampled. */
export const COLOR_SAMPLE_INTERVAL_MS = 300;

/** Size (in source video pixels) of the square sampled under the reticle. */
export const COLOR_SAMPLE_SIZE = 9;

/** How long the color must stay the same before the live name is fetched. */
export const LIVE_COLOR_NAME_DEBOUNCE_MS = 800;

/**
 * How far (RGB Euclidean distance) the live color can drift before it counts
 * as a new color and the live name is looked up again.
 */
export const LIVE_COLOR_NAME_TOLERANCE = 30;
