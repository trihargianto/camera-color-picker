import { ref, computed, onMounted, onUnmounted, watch, Ref } from "vue";
import { rgbToHex } from "../utils/rgb-to-hex";

export function useCanvasColorCapture(
  capturedImage: Ref<ImageCapture | null>,
  canvasRef: Ref<HTMLCanvasElement | null>,
  emit: (event: "on-color-captured", color: string) => void,
) {
  const capturedColor = ref<{ r: number; g: number; b: number }>({
    r: 0,
    g: 0,
    b: 0,
  });

  const capturedColorHex = computed(() => {
    const { r, g, b } = capturedColor.value;

    return rgbToHex(r, g, b);
  });

  const intervalId = ref<number | null>(null);

  onMounted(() => {
    intervalId.value = window.setInterval(() => {
      setCapturedColorFromCanvas();
    }, 500);
  });

  onUnmounted(() => {
    if (intervalId.value) {
      window.clearInterval(intervalId.value);
    }
  });

  watch(capturedColorHex, () => {
    if (capturedColorHex.value) {
      emit("on-color-captured", capturedColorHex.value);
    }
  });

  async function setCapturedColorFromCanvas() {
    try {
      if (canvasRef.value && capturedImage.value) {
        const imageBitmap = await capturedImage.value.grabFrame();

        const canvas = canvasRef.value;

        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;

        const canvasContext2d = canvas.getContext("2d");

        if (canvasContext2d) {
          canvasContext2d.drawImage(imageBitmap, 0, 0);

          const centeredXCoordinate = canvas.width / 2;
          const centeredYCoordinate = canvas.height / 2;

          const [r, g, b] = canvasContext2d.getImageData(
            centeredXCoordinate,
            centeredYCoordinate,
            1,
            1,
          ).data;

          capturedColor.value = { r, g, b };
        }
      }
    } catch (error) {
      console.error("setCapturedColorFromCanvas() error: ", error);
    }
  }

  return { capturedColor, capturedColorHex };
}
