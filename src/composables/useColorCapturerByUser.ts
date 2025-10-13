import { ref } from "vue";
import { playCameraShutterSound } from "../utils/sound-player";
import { getBasicColorNameByHex } from "../api/endpoints/colornames";

export function useColorCapturerByUser(showModalCapturedColor: Function) {
  const capturedColorHex = ref<string>("");
  const capturedColorHexByUser = ref<string>("");
  const capturedColorNameByUser = ref<string | null>("");
  const capturedColorError = ref<string | null>("");
  const colorNameCache = new Map<string, string>();

  async function captureColorByUser() {
    playCameraShutterSound();

    const hexKey = capturedColorHex.value;

    // Reset error state
    capturedColorError.value = null;

    // Check cache first
    if (colorNameCache.has(hexKey)) {
      capturedColorNameByUser.value = colorNameCache.get(hexKey) || null;
    } else {
      try {
        const response = await getBasicColorNameByHex(hexKey);
        const colorName = response.data.paletteTitle;

        // Store in cache
        colorNameCache.set(hexKey, colorName);
        capturedColorNameByUser.value = colorName;
      } catch (err) {
        console.error("Error fetching color name:", err);
        capturedColorNameByUser.value = "Unknown Color";
        capturedColorError.value =
          "Could not fetch color name. Please check your internet connection and try again.";
      }
    }

    capturedColorHexByUser.value = capturedColorHex.value;

    showModalCapturedColor();
  }

  function setCapturedColorHex(colorHex: string) {
    capturedColorHex.value = colorHex;
  }

  return {
    capturedColorHex,
    capturedColorHexByUser,
    capturedColorNameByUser,
    capturedColorError,
    captureColorByUser,
    setCapturedColorHex,
  };
}
