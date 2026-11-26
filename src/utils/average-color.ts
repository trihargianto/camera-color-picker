export type Rgb = { r: number; g: number; b: number };

/**
 * Average the RGB channels of RGBA pixel data (as returned by `getImageData`).
 * Sampling an area instead of one pixel smooths out camera sensor noise.
 */
export function averageColor(data: ArrayLike<number>): Rgb {
  const pixelCount = Math.floor(data.length / 4);

  if (pixelCount === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  let r = 0;
  let g = 0;
  let b = 0;

  for (let i = 0; i < pixelCount * 4; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount),
  };
}
