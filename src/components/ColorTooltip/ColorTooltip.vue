<template>
  <!-- The outline keeps the tooltip visible over a scene of the same color -->
  <div
    class="flex items-center [filter:drop-shadow(0_0_1px_#fff)_drop-shadow(0_2px_6px_rgba(0,0,0,0.45))]"
    :class="props.placement === 'top' ? 'flex-col' : 'flex-col-reverse'"
  >
    <div
      class="flex min-w-[128px] flex-col items-center justify-center rounded-xl px-4 py-1.5 text-center"
      :style="{ backgroundColor: hexWithHash, color: textColor }"
    >
      <p v-if="$slots.default" class="text-base font-bold leading-tight">
        <slot />
      </p>
      <p class="text-xs font-medium tabular-nums opacity-80">
        {{ hexWithHash }}
      </p>
    </div>

    <div
      class="h-0 w-0 border-l-[10px] border-r-[10px] border-solid border-l-transparent border-r-transparent"
      :class="
        props.placement === 'top'
          ? '-mt-px border-t-[10px]'
          : '-mb-px border-b-[10px]'
      "
      :style="{
        [props.placement === 'top' ? 'borderTopColor' : 'borderBottomColor']:
          hexWithHash,
        transform: `translateX(${props.arrowOffset}px)`,
      }"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { normalizeHex, readableTextColor } from "../../utils/rgb-to-hex";

defineOptions({
  name: "ColorTooltip",
});

const props = withDefaults(
  defineProps<{
    /** Color to show, with or without a leading `#` */
    hexColor: string;
    /** Side of the pointed-at spot the tooltip sits on */
    placement?: "top" | "bottom";
    /**
     * Shift the arrow sideways (px), for when the tooltip is pushed in from an
     * edge but the arrow must still point at the spot
     */
    arrowOffset?: number;
  }>(),
  { placement: "top", arrowOffset: 0 },
);

const hexWithHash = computed(() => `#${normalizeHex(props.hexColor)}`);
const textColor = computed(() => readableTextColor(props.hexColor));
</script>
