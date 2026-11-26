import { describe, expect, it } from "vitest";
import { averageColor } from "./average-color";

describe("averageColor", () => {
  it("returns the color of a single pixel", () => {
    expect(averageColor([10, 20, 30, 255])).toEqual({ r: 10, g: 20, b: 30 });
  });

  it("averages RGB channels and ignores alpha", () => {
    const data = [0, 0, 0, 255, 100, 200, 50, 0];

    expect(averageColor(data)).toEqual({ r: 50, g: 100, b: 25 });
  });

  it("returns black for empty data", () => {
    expect(averageColor([])).toEqual({ r: 0, g: 0, b: 0 });
  });
});
