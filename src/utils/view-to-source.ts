export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

/**
 * Convert a point in the viewfinder (0 to 1 on each axis) to a pixel in the
 * camera image shown inside it.
 *
 * The image fills the viewfinder like CSS `object-fit: cover`, so the parts
 * that stick out are cropped, and the front camera is shown mirrored.
 */
export function viewToSourcePoint(
  point: Point,
  view: Size,
  source: Size,
  isMirrored: boolean,
): Point {
  const x = isMirrored ? 1 - point.x : point.x;

  const scale = Math.max(
    view.width / source.width,
    view.height / source.height,
  );
  const cropX = (source.width * scale - view.width) / 2;
  const cropY = (source.height * scale - view.height) / 2;

  return {
    x: (x * view.width + cropX) / scale,
    y: (point.y * view.height + cropY) / scale,
  };
}
