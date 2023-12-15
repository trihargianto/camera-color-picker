export function hexToColorName(hex: string) {
  if (window.ntc) {
    const [_, colorName] = window.ntc.name(hex);

    return colorName;
  }

  return null;
}
