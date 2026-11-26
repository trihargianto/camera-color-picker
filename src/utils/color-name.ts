import { nearest, differenceCiede2000 } from "./culori";
import { COLOR_NAMES } from "../constants/color-names";

// CIEDE2000 measures how different two colors look to the human eye.
const findClosest = nearest(
  COLOR_NAMES,
  differenceCiede2000(),
  (entry) => entry.hex,
);

/** Name of the listed color that looks closest to `hex` (with or without `#`). */
export function getColorName(hex: string) {
  const [closest] = findClosest(hex.startsWith("#") ? hex : `#${hex}`);

  return closest.name;
}
