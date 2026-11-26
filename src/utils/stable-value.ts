/**
 * Smooths a noisy stream of values. A new value only replaces the current one
 * after it shows up `requiredRepeats` times in a row, so a single odd sample
 * does not flicker through. `null` (no value) is taken immediately, and so is
 * any value passed with `force` (for input that is not noisy, like a still
 * image).
 */
export function createStableValue<T>(requiredRepeats: number) {
  let stable: T | null = null;
  let candidate: T | null = null;
  let count = 0;

  return function next(value: T | null, force = false): T | null {
    if (force || value === null || stable === null || value === stable) {
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
