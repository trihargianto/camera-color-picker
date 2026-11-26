// https://stackoverflow.com/a/39077686
export function rgbToHex(r: number, g: number, b: number) {
  return [r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/** Remove a leading `#` and uppercase the value, e.g. `#ff0000` -> `FF0000`. */
export function normalizeHex(hex: string) {
  return hex.replace(/^#/, "").toUpperCase();
}

/**
 * Pick black or white text for the best contrast on the given background hex
 * (with or without `#`), using WCAG relative luminance.
 */
export function readableTextColor(hex: string) {
  const value = normalizeHex(hex);

  if (!/^[0-9A-F]{6}$/.test(value)) {
    return "#000000";
  }

  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(value.slice(i, i + 2), 16) / 255;

    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Contrast with black beats contrast with white above ~0.179 luminance.
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}
