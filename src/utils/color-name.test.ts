import { describe, expect, it } from "vitest";
import { differenceCiede2000 } from "./culori";
import { getColorName } from "./color-name";

describe("getColorName", () => {
  it("names exact list colors", () => {
    expect(getColorName("#FF0000")).toBe("Red");
    expect(getColorName("000080")).toBe("Navy");
  });

  it("names everyday camera colors", () => {
    expect(getColorName("#C62828")).toBe("Red"); // slightly muted red
    expect(getColorName("#2E7D32")).toBe("Green"); // leaf green
    expect(getColorName("#F5F5F0")).toBe("White"); // off-white paper
    expect(getColorName("#1A1A1A")).toBe("Black"); // near black
    expect(getColorName("#FB8C00")).toBe("Orange");
    expect(getColorName("#6D4C41")).toBe("Brown");
  });
});

// Reference values from Sharma, Wu & Dalal (2005), "The CIEDE2000
// Color-Difference Formula: Implementation Notes, Supplementary Test Data".
// They check that culori's CIEDE2000 matches the published standard.
describe("CIEDE2000 (culori)", () => {
  const deltaE = differenceCiede2000();
  const lab = (l: number, a: number, b: number) => ({
    mode: "lab65" as const,
    l,
    a,
    b,
  });

  it.each([
    [lab(50, 2.6772, -79.7751), lab(50, 0, -82.7485), 2.0425],
    [lab(50, 3.1571, -77.2803), lab(50, 0, -82.7485), 2.8615],
    [lab(50, 0, 0), lab(50, -1, 2), 2.3669],
    [lab(50, 2.5, 0), lab(73, 25, -18), 27.1492],
  ])("matches published test pair %#", (a, b, expected) => {
    expect(deltaE(a, b)).toBeCloseTo(expected, 4);
  });
});
