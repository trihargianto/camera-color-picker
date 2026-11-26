import { describe, expect, it } from "vitest";
import { createStableValue } from "./stable-value";

describe("createStableValue", () => {
  it("takes the first value immediately", () => {
    const next = createStableValue<string>(2);

    expect(next("Red")).toBe("Red");
  });

  it("ignores a single odd value", () => {
    const next = createStableValue<string>(2);

    next("Red");
    expect(next("Orange")).toBe("Red");
    expect(next("Red")).toBe("Red");
    expect(next("Orange")).toBe("Red");
  });

  it("switches after the value repeats enough times in a row", () => {
    const next = createStableValue<string>(2);

    next("Red");
    expect(next("Orange")).toBe("Red");
    expect(next("Orange")).toBe("Orange");
  });

  it("restarts the count when the candidate changes", () => {
    const next = createStableValue<string>(2);

    next("Red");
    next("Orange");
    expect(next("Pink")).toBe("Red");
    expect(next("Pink")).toBe("Pink");
  });

  it("clears immediately on null", () => {
    const next = createStableValue<string>(3);

    next("Red");
    expect(next(null)).toBeNull();
    expect(next("Blue")).toBe("Blue");
  });
});
