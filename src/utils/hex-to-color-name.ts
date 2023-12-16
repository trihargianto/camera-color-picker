import ntc from "@trihargianto/ntcjs";

export function hexToColorName(hex: string) {
  const [_, colorName] = ntc.name(hex);

  return colorName;

  return null;
}
