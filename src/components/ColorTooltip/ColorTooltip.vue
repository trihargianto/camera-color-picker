<template>
  <div class="flex flex-col items-center">
    <div
      class="flex min-w-[120px] flex-col items-center justify-center rounded-lg px-3 py-1 text-center shadow-md"
      :style="{ backgroundColor: hexWithHash, color: textColor }"
    >
      <p class="text-xs font-semibold">{{ hexWithHash }}</p>
      <p v-if="$slots.default" class="text-[11px]"><slot /></p>
    </div>

    <div
      class="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[10px] border-solid border-l-transparent border-r-transparent"
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
