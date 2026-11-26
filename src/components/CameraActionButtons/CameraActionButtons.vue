<template>
  <div class="my-3 mt-12 flex w-full items-center justify-center gap-14">
    <div v-if="!props.capturedColorHexByUser" class="w-12" />
    <button
      v-else
      type="button"
      class="h-12 w-12 rounded-sm border border-white"
      :style="{
        backgroundColor: `#${normalizeHex(props.capturedColorHexByUser)}`,
      }"
      :aria-label="`Show last captured color #${normalizeHex(props.capturedColorHexByUser)}`"
      @click="emit('on-click-captured-color-button')"
    />

    <div class="flex items-center justify-center rounded-full bg-white p-1">
      <button
        type="button"
        class="h-20 w-20 rounded-full border-2 border-black bg-gradient-to-r from-[rgb(131,58,180)] via-[rgb(253,29,29)] to-[rgb(252,176,69)] transition-opacity active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Capture color"
        :disabled="props.isShutterDisabled"
        @click="emit('on-click-shutter-button')"
      />
    </div>

    <button
      type="button"
      class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.5)] text-center text-white"
      aria-label="Switch camera"
      @click="emit('on-click-flip-camera-button')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
        aria-hidden="true"
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
import { normalizeHex } from "../../utils/rgb-to-hex";

defineOptions({
  name: "CameraActionButtons",
});

const props = withDefaults(
  defineProps<{
    /** Last color captured by the user (hex, with or without `#`) */
    capturedColorHexByUser: string | null;
    /** Disable the shutter, e.g. while the camera is not ready */
    isShutterDisabled?: boolean;
  }>(),
  { isShutterDisabled: false },
);

const emit = defineEmits<{
  /** Emitted when the shutter button is clicked */
  "on-click-shutter-button": [];
  /** Emitted when the flip camera button is clicked */
  "on-click-flip-camera-button": [];
  /** Emitted when the captured color button is clicked */
  "on-click-captured-color-button": [];
}>();
</script>
