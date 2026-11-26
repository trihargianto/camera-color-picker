import { ref } from "vue";
import { playCameraShutterSound } from "../utils/sound-player";

export function useColorCapturerByUser(onCaptured: () => void) {
  const liveColorHex = ref<string | null>(null);
  const liveColorName = ref<string | null>(null);
  const capturedColorHexByUser = ref<string | null>(null);
  const capturedColorNameByUser = ref<string | null>(null);

  function captureColorByUser() {
    const hex = liveColorHex.value;

    if (!hex) {
      return;
    }

    playCameraShutterSound();

    // A short tap on phones that support it (Android). No-op elsewhere.
    navigator.vibrate?.(10);

    capturedColorHexByUser.value = hex;
    // The name already on screen, not a fresh lookup, so the two always match
    capturedColorNameByUser.value = liveColorName.value;

    onCaptured();
  }

  function setLiveColor(colorHex: string | null, colorName: string | null) {
    liveColorHex.value = colorHex;
    liveColorName.value = colorName;
  }

  return {
    liveColorHex,
    capturedColorHexByUser,
    capturedColorNameByUser,
    captureColorByUser,
    setLiveColor,
  };
}
