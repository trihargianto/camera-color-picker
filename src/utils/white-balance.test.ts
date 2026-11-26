import { describe, expect, it } from "vitest";
import { applyWhiteBalance } from "./white-balance";

describe("applyWhiteBalance", () => {
  it("turns the reference itself into a neutral gray", () => {
    const warmPaper = { r: 230, g: 205, b: 160 };
    const { r, g, b } = applyWhiteBalance(warmPaper, warmPaper);

    expect(Math.abs(r - g)).toBeLessThanOrEqual(1);
    expect(Math.abs(g - b)).toBeLessThanOrEqual(1);
  });

  it("removes the same color cast from other colors", () => {
    // Under warm light, a gray card reads yellowish and a blue reads dull.
    const warmPaper = { r: 230, g: 205, b: 160 };
    const warmBlue = { r: 60, g: 80, b: 140 };

    const corrected = applyWhiteBalance(warmBlue, warmPaper);

    expect(corrected.b).toBeGreaterThan(warmBlue.b);
    expect(corrected.r).toBeLessThan(warmBlue.r);
  });

  it("leaves colors unchanged when the reference is already neutral", () => {
    const gray = { r: 128, g: 128, b: 128 };
    const color = { r: 200, g: 50, b: 90 };

    expect(applyWhiteBalance(color, gray)).toEqual(color);
  });

  it("caps the correction for extreme references", () => {
    const pureRed = { r: 255, g: 0, b: 0 };
    const color = { r: 100, g: 100, b: 100 };

    const corrected = applyWhiteBalance(color, pureRed);

    // Green and blue had no signal, so they are left alone instead of
    // being multiplied by infinity.
    expect(corrected.g).toBe(100);
    expect(corrected.b).toBe(100);
  });
});
