/**
 * Smooths a noisy stream of values. A new value only replaces the current one
 * after it shows up `requiredRepeats` times in a row, so a single odd sample
 * does not flicker through. `null` (no value) is taken immediately.
 */
export function createStableValue<T>(requiredRepeats: number) {
  let stable: T | null = null;
  let candidate: T | null = null;
  let count = 0;

  return function next(value: T | null): T | null {
    if (value === null || stable === null || value === stable) {
      stable = value;
      candidate = null;
      count = 0;

      return stable;
    }

    if (value === candidate) {
      count++;
    } else {
      candidate = value;
      count = 1;
    }

    if (count >= requiredRepeats) {
      stable = value;
      candidate = null;
      count = 0;
    }

    return stable;
  };
}
