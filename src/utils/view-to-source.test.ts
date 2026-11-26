import { describe, expect, it } from "vitest";
import { viewToSourcePoint } from "./view-to-source";

const view = { width: 300, height: 300 };
const landscape = { width: 1280, height: 720 };

describe("viewToSourcePoint", () => {
  it("maps the center to the center", () => {
    expect(
      viewToSourcePoint({ x: 0.5, y: 0.5 }, view, landscape, false),
    ).toEqual({ x: 640, y: 360 });
  });

  it("skips the cropped sides of a wide image", () => {
    // A 1280x720 image covering a square shows only its middle 720x720
    const left = viewToSourcePoint({ x: 0, y: 0 }, view, landscape, false);
    const right = viewToSourcePoint({ x: 1, y: 1 }, view, landscape, false);

    expect(left.x).toBeCloseTo(280);
    expect(left.y).toBeCloseTo(0);
    expect(right.x).toBeCloseTo(1000);
    expect(right.y).toBeCloseTo(720);
  });

  it("flips the x axis for a mirrored image", () => {
    const point = viewToSourcePoint({ x: 0, y: 0.5 }, view, landscape, true);

    expect(point.x).toBeCloseTo(1000);
    expect(point.y).toBeCloseTo(360);
  });

  it("skips the cropped top and bottom of a tall image", () => {
    const portrait = { width: 720, height: 1280 };
    const top = viewToSourcePoint({ x: 0.5, y: 0 }, view, portrait, false);

    expect(top.x).toBeCloseTo(360);
    expect(top.y).toBeCloseTo(280);
  });
});
