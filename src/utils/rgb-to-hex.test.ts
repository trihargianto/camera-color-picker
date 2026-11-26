import { describe, expect, it } from "vitest";
import { normalizeHex, readableTextColor, rgbToHex } from "./rgb-to-hex";

describe("rgbToHex", () => {
  it("converts RGB channels to an uppercase hex string", () => {
    expect(rgbToHex(255, 0, 128)).toBe("FF0080");
  });

  it("pads single-digit channels", () => {
    expect(rgbToHex(0, 1, 15)).toBe("00010F");
  });

  it("rounds fractional channels", () => {
    expect(rgbToHex(254.6, 0.4, 10.5)).toBe("FF000B");
  });
});

describe("normalizeHex", () => {
  it("removes a leading hash and uppercases", () => {
    expect(normalizeHex("#ff00aa")).toBe("FF00AA");
  });

  it("leaves a normalized value unchanged", () => {
    expect(normalizeHex("FF00AA")).toBe("FF00AA");
  });
});

describe("readableTextColor", () => {
  it("uses black text on light colors", () => {
    expect(readableTextColor("#FFFF00")).toBe("#000000");
    expect(readableTextColor("FFFFFF")).toBe("#000000");
  });

  it("uses white text on dark colors", () => {
    expect(readableTextColor("#000000")).toBe("#FFFFFF");
    expect(readableTextColor("#1E3A8A")).toBe("#FFFFFF");
  });

  it("falls back to black for invalid input", () => {
    expect(readableTextColor("not-a-color")).toBe("#000000");
  });
});
