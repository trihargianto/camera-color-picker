<template>
  <div
    v-if="isModalVisible"
    class="fixed bottom-[0] left-[0] right-[0] top-[0] z-20 flex h-full w-full items-center justify-center bg-white text-black"
    :style="`background-color: ${colorHexWithHash}`"
  >
    <div
      class="flex w-80 flex-col items-center justify-center rounded-xl bg-white px-7 pb-2 pt-10"
    >
      <div
        class="mb-6 h-20 w-20 rounded-full"
        :style="`background-color: ${colorHexWithHash}`"
      />

      <p class="mb-1 text-xl font-semibold">
        {{ props.colorName }}
      </p>

      <p class="text-lg text-gray-400">
        {{ colorHexWithHash }}
      </p>

      <div
        v-if="props.errorMessage"
        class="mt-4 flex items-start rounded-md bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="mr-2 mt-0.5 h-5 w-5 flex-shrink-0"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <span>{{ props.errorMessage }}</span>
      </div>

      <div class="mb-6" />

      <button
        type="button"
        class="mb-1 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-4 font-semibold text-white hover:bg-blue-500"
        @click="copyHexColorToClipboard()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="mr-1 h-5 w-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
          />
        </svg>

        <span>Copy hex color to clipboard</span>
      </button>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-4 font-semibold text-gray-800"
        @click="closeModal()"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";

defineOptions({
  name: "ModalCapturedColor",
});

const props = defineProps({
  /**
   * Set to true to show the modal
   */
  modelValue: {
    type: Boolean,
    default: false,
  },

  /**
   * Set the color theme of the modal
   */
  colorHex: {
    type: [String, null] as PropType<string | null>,
    default: null,
  },

  /**
   * Color name
   */
  colorName: {
    type: [String, null] as PropType<string | null>,
    default: null,
  },

  /**
   * Error message to display
   */
  errorMessage: {
    type: [String, null] as PropType<string | null>,
    default: null,
  },
});

const emit = defineEmits([
  /**
   * Emitted when the modal is closed. Used internally for v-model
   */
  "update:modelValue",
]);

const isModalVisible = computed(() => {
  return props.modelValue;
});

const colorHexWithHash = computed(() => {
  return `#${props.colorHex}`;
});

function closeModal() {
  emit("update:modelValue", false);
}

async function copyHexColorToClipboard() {
  try {
    if (props.colorHex) {
      await navigator.clipboard.writeText(colorHexWithHash.value);

      window.alert("Content copied to clipboard 🙌");
    }
  } catch (err) {
    window.alert("Failed to copy 😢");

    console.error("Error copyHexColorToClipboard()", err);
  }
}
</script>
