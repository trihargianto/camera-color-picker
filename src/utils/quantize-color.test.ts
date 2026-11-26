import { describe, expect, it } from "vitest";
import { quantizeColor } from "./quantize-color";

describe("quantizeColor", () => {
  it("snaps nearby noisy colors to the same value", () => {
    expect(quantizeColor({ r: 121, g: 66, b: 9 })).toEqual(
      quantizeColor({ r: 124, g: 62, b: 12 }),
    );
  });

  it("never goes above 255", () => {
    expect(quantizeColor({ r: 255, g: 250, b: 249 })).toEqual({
      r: 255,
      g: 255,
      b: 255,
    });
  });
});
