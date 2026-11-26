<template>
  <!-- The outline keeps the tooltip visible over a scene of the same color -->
  <div
    class="flex flex-col items-center [filter:drop-shadow(0_0_1px_#fff)_drop-shadow(0_2px_6px_rgba(0,0,0,0.45))]"
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
      class="-mt-px h-0 w-0 border-l-[10px] border-r-[10px] border-t-[10px] border-solid border-l-transparent border-r-transparent"
      :style="{ borderTopColor: hexWithHash }"
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

const props = defineProps<{
  /** Color to show, with or without a leading `#` */
  hexColor: string;
}>();

const hexWithHash = computed(() => `#${normalizeHex(props.hexColor)}`);
const textColor = computed(() => readableTextColor(props.hexColor));
</script>
