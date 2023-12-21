import ntc from "@trihargianto/ntcjs";

export function hexToColorName(hex: string) {
  const [_, __, ___, colorGroupName] = ntc.name(hex);

  return colorGroupName;
}
