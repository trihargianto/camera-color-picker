import { computed, ref, type Ref } from "vue";

import type { Point } from "../utils/view-to-source";

const CENTER: Point = { x: 0.5, y: 0.5 };

/** How close the point may get to the edges (0 to 1), so it stays fully in view. */
const EDGE = 0.06;

/** Movement (px) after which a press counts as a drag, not a tap. */
const DRAG_THRESHOLD_PX = 6;

/** Arrow key step (0 to 1); Shift moves further. */
const KEY_STEP = 0.02;
const KEY_STEP_LARGE = 0.1;

/**
 * Where the user wants to sample, as a point in the viewfinder (0 to 1 on
 * each axis). A tap places the point under the finger. A drag moves it by
 * the finger's movement, not to the finger, so the user can drag from below
 * and still see the spot. Arrow keys move it too.
 */
export function useReticlePosition(areaRef: Ref<HTMLElement | null>) {
  const position = ref<Point>({ ...CENTER });
  const isDragging = ref(false);

  const isCentered = computed(
    () => position.value.x === CENTER.x && position.value.y === CENTER.y,
  );

  let press: {
    pointerId: number;
    startX: number;
    startY: number;
    startPosition: Point;
  } | null = null;

  function onPointerDown(event: PointerEvent) {
    if (!event.isPrimary || event.button > 0) {
      return;
    }

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

    press = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: { ...position.value },
    };
  }

  function onPointerMove(event: PointerEvent) {
    const area = areaRef.value;

    if (!press || event.pointerId !== press.pointerId || !area) {
      return;
    }

    const dx = event.clientX - press.startX;
    const dy = event.clientY - press.startY;

    if (!isDragging.value && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
      return;
    }

    isDragging.value = true;

    const { width, height } = area.getBoundingClientRect();

    setPosition({
      x: press.startPosition.x + dx / width,
      y: press.startPosition.y + dy / height,
    });
  }

  function onPointerUp(event: PointerEvent) {
    const area = areaRef.value;

    if (!press || event.pointerId !== press.pointerId) {
      return;
    }

    if (!isDragging.value && area) {
      const rect = area.getBoundingClientRect();

      setPosition({
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      });
    }

    endPress();
  }

  function endPress() {
    press = null;
    isDragging.value = false;
  }

  function onKeyDown(event: KeyboardEvent) {
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const move = moves[event.key];

    if (!move) {
      return;
    }

    event.preventDefault();

    setPosition({
      x: position.value.x + move.x,
      y: position.value.y + move.y,
    });
  }

  function setPosition(point: Point) {
    position.value = {
      x: clamp(point.x, EDGE, 1 - EDGE),
      y: clamp(point.y, EDGE, 1 - EDGE),
    };
  }

  function recenter() {
    position.value = { ...CENTER };
  }

  return {
    position,
    isDragging,
    isCentered,
    recenter,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: endPress,
    onKeyDown,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
