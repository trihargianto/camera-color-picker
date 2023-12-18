<template>
  <div class="flex h-full w-full flex-col justify-center bg-black">
    <AppLogo />

    <div class="container mx-auto flex flex-col items-center justify-center">
      <CameraColorCapture
        :is-front-camera="isFrontCamera"
        @on-color-captured="setCapturedColorHex"
      />

      <CameraActionButtons
        :captured-color-hex-by-user="capturedColorHexByUser"
        @on-click-captured-color-button="showModalCapturedColor()"
        @on-click-flip-camera-button="flipCamera()"
        @on-click-shutter-button="captureColorByUser()"
      />
    </div>

    <ModalCapturedColor
      v-model="isModalCapturedColorVisible"
      :color-hex="capturedColorHexByUser"
      :color-name="capturedColorNameByUser"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import AppLogo from "./components/AppLogo";
import CameraColorCapture from "./components/CameraColorCapture";
import CameraActionButtons from "./components/CameraActionButtons";
import ModalCapturedColor from "./components/ModalCapturedColor";
import { playCameraShutterSound } from "./utils/sound-player";
import { hexToColorName } from "./utils/hex-to-color-name";

const { isModalCapturedColorVisible, showModalCapturedColor } = useModal();
const { isFrontCamera, flipCamera } = useCameraHandler();

const {
  capturedColorHexByUser,
  capturedColorNameByUser,
  setCapturedColorHex,
  captureColorByUser,
} = useColorCapturerByUser(showModalCapturedColor);

/**
 * COMPOSABLE SPECIFIC TO THIS COMPONENT
 */
function useColorCapturerByUser(showModalCapturedColor: Function) {
  const capturedColorHex = ref<string | null>(null);
  const capturedColorHexByUser = ref<string | null>(null);

  const capturedColorNameByUser = computed(() => {
    return capturedColorHexByUser.value
      ? hexToColorName(capturedColorHexByUser.value)
      : null;
  });

  function captureColorByUser() {
    playCameraShutterSound();

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
    captureColorByUser,
    setCapturedColorHex,
  };
}

function useCameraHandler() {
  const isFrontCamera = ref<boolean>(false);

  function flipCamera() {
    isFrontCamera.value = !isFrontCamera.value;
  }

  return {
    isFrontCamera,
    flipCamera,
  };
}

function useModal() {
  const isModalCapturedColorVisible = ref<boolean>(false);

  function showModalCapturedColor() {
    isModalCapturedColorVisible.value = true;
  }

  return {
    isModalCapturedColorVisible,
    showModalCapturedColor,
  };
}
</script>
./components/CameraColorCapture
