<template>
  <dialog
    ref="dialogRef"
    class="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-transparent"
    aria-labelledby="captured-color-title"
    @close="isModalVisible = false"
  >
    <div
      class="flex h-full w-full items-center justify-center p-4 text-black"
      :style="{ backgroundColor: colorHexWithHash }"
      @click.self="isModalVisible = false"
    >
      <div
        class="flex w-80 max-w-full flex-col items-center justify-center rounded-xl bg-white px-7 pb-2 pt-10"
      >
        <div
          class="mb-6 h-20 w-20 rounded-full border border-gray-200"
          :style="{ backgroundColor: colorHexWithHash }"
          aria-hidden="true"
        />

        <p id="captured-color-title" class="mb-1 text-xl font-semibold">
          {{ props.colorName }}
        </p>

        <p class="text-lg text-gray-500">
          {{ colorHexWithHash }}
        </p>

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
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
            />
          </svg>

          <span aria-live="polite">{{ copyButtonLabel }}</span>
        </button>
        <button
          type="button"
          class="inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-4 font-semibold text-gray-800"
          @click="isModalVisible = false"
        >
          Close
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch, onMounted } from "vue";
import { normalizeHex } from "../../utils/rgb-to-hex";

defineOptions({
  name: "ModalCapturedColor",
});

/** Set to `true` to show the modal */
const isModalVisible = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    /** Captured color (hex, with or without `#`). Also sets the modal theme */
    colorHex?: string | null;
    /** Color name */
    colorName?: string | null;
  }>(),
  {
    colorHex: null,
    colorName: null,
  },
);

const dialogRef = ref<HTMLDialogElement | null>(null);

type CopyState = "idle" | "copied" | "failed";

const copyState = ref<CopyState>("idle");
let copyStateTimeoutId: number | undefined;

const colorHexWithHash = computed(() =>
  props.colorHex ? `#${normalizeHex(props.colorHex)}` : "",
);

const copyButtonLabel = computed(() => {
  switch (copyState.value) {
    case "copied":
      return "Copied!";
    case "failed":
      return "Failed to copy";
    default:
      return "Copy hex color to clipboard";
  }
});

onMounted(syncDialog);
watch(isModalVisible, syncDialog);

onUnmounted(() => window.clearTimeout(copyStateTimeoutId));

function syncDialog() {
  const dialog = dialogRef.value;

  if (!dialog) {
    return;
  }

  if (isModalVisible.value && !dialog.open) {
    dialog.showModal();
  } else if (!isModalVisible.value && dialog.open) {
    dialog.close();
  }

  if (!isModalVisible.value) {
    copyState.value = "idle";
  }
}

async function copyHexColorToClipboard() {
  if (!props.colorHex) {
    return;
  }

  try {
    await navigator.clipboard.writeText(colorHexWithHash.value);
    copyState.value = "copied";
  } catch (err) {
    copyState.value = "failed";
    console.error("Error copyHexColorToClipboard()", err);
  }

  window.clearTimeout(copyStateTimeoutId);
  copyStateTimeoutId = window.setTimeout(() => {
    copyState.value = "idle";
  }, 2000);
}
</script>
