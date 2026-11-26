import { describe, expect, it } from "vitest";
import { colorDistance } from "./color-distance";

describe("colorDistance", () => {
  it("is 0 for the same color", () => {
    expect(colorDistance({ r: 1, g: 2, b: 3 }, { r: 1, g: 2, b: 3 })).toBe(0);
  });

  it("measures Euclidean distance in RGB space", () => {
    expect(colorDistance({ r: 0, g: 0, b: 0 }, { r: 3, g: 4, b: 0 })).toBe(5);
  });
});
