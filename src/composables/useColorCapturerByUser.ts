import { ref } from "vue";
import { playCameraShutterSound } from "../utils/sound-player";
import { getCachedBasicColorNameByHex } from "../api/endpoints/colornames";

export function useColorCapturerByUser(onCaptured: () => void) {
  const liveColorHex = ref<string | null>(null);
  const capturedColorHexByUser = ref<string | null>(null);
  const capturedColorNameByUser = ref<string | null>(null);
  const capturedColorError = ref<string | null>(null);
  const isFetchingColorName = ref<boolean>(false);

  let captureId = 0;

  async function captureColorByUser() {
    const hex = liveColorHex.value;

    if (!hex) {
      return;
    }

    playCameraShutterSound();

    const currentCaptureId = ++captureId;

    capturedColorHexByUser.value = hex;
    capturedColorNameByUser.value = null;
    capturedColorError.value = null;
    isFetchingColorName.value = true;

    onCaptured();

    try {
      const name = await getCachedBasicColorNameByHex(hex);

      if (currentCaptureId === captureId) {
        capturedColorNameByUser.value = name;
      }
    } catch (err) {
      if (currentCaptureId === captureId) {
        console.error("Error fetching color name:", err);
        capturedColorNameByUser.value = "Unknown Color";
        capturedColorError.value =
          "Could not fetch color name. Please check your internet connection and try again.";
      }
    } finally {
      if (currentCaptureId === captureId) {
        isFetchingColorName.value = false;
      }
    }
  }

  function setLiveColorHex(colorHex: string | null) {
    liveColorHex.value = colorHex;
  }

  return {
    liveColorHex,
    capturedColorHexByUser,
    capturedColorNameByUser,
    capturedColorError,
    isFetchingColorName,
    captureColorByUser,
    setLiveColorHex,
  };
}
