<template>
  <div class="my-3 mt-12 flex w-full items-center justify-center gap-14">
    <div
      class="h-11 w-11 cursor-pointer rounded-sm border border-white bg-white"
      :style="`background: ${props.capturedColorHexByUser}`"
    />

    <div class="flex items-center justify-center rounded-full bg-white p-1">
      <div
        class="h-20 w-20 cursor-pointer rounded-full border-2 border-black bg-white"
        style="
          background: rgb(131, 58, 180);
          background: linear-gradient(
            90deg,
            rgba(131, 58, 180, 1) 0%,
            rgba(253, 29, 29, 1) 50%,
            rgba(252, 176, 69, 1) 100%
          );
        "
        role="button"
        @click="$emit('on-click-shutter-button')"
      />
    </div>

    <button
      class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.5)] text-center text-white"
      @click="$emit('on-click-flip-camera-button')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineOptions({
  name: "CameraActionButtons",
});

const emit = defineEmits([
  /**
   * Emitted when the shutter button is clicked.
   */
  "on-click-shutter-button",

  /**
   * Emitted when the flip camera button is clicked.
   */
  "on-click-flip-camera-button",
]);

const props = defineProps({
  /**
   * Captured color hex by user.
   */
  capturedColorHexByUser: {
    type: [String, null] as PropType<string | null>,
    required: true,
  },
});
</script>
