import { ref } from "vue";
import { playCameraShutterSound } from "../utils/sound-player";
import { getColorName } from "../utils/color-name";

export function useColorCapturerByUser(onCaptured: () => void) {
  const liveColorHex = ref<string | null>(null);
  const capturedColorHexByUser = ref<string | null>(null);
  const capturedColorNameByUser = ref<string | null>(null);

  function captureColorByUser() {
    const hex = liveColorHex.value;

    if (!hex) {
      return;
    }

    playCameraShutterSound();

    capturedColorHexByUser.value = hex;
    capturedColorNameByUser.value = getColorName(hex);

    onCaptured();
  }

  function setLiveColorHex(colorHex: string | null) {
    liveColorHex.value = colorHex;
  }

  return {
    liveColorHex,
    capturedColorHexByUser,
    capturedColorNameByUser,
    captureColorByUser,
    setLiveColorHex,
  };
}
