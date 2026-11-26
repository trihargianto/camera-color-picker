<template>
  <!-- Full-height camera screen, padded away from the notch and home indicator -->
  <main
    class="flex h-full w-full flex-col items-center gap-5 bg-black pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[max(1rem,env(safe-area-inset-top))]"
  >
    <AppLogo />

    <CameraColorCapture
      :is-front-camera="isFrontCamera"
      @on-color-captured="setLiveColor"
    />

    <CameraActionButtons
      :captured-color-hex-by-user="capturedColorHexByUser"
      :is-shutter-disabled="!liveColorHex"
      @on-click-captured-color-button="showModalCapturedColor()"
      @on-click-flip-camera-button="flipCamera()"
      @on-click-shutter-button="captureColorByUser()"
    />

    <ModalCapturedColor
      v-model="isModalCapturedColorVisible"
      :color-hex="capturedColorHexByUser"
      :color-name="capturedColorNameByUser"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";

import AppLogo from "./components/AppLogo";
import CameraColorCapture from "./components/CameraColorCapture";
import CameraActionButtons from "./components/CameraActionButtons";
import ModalCapturedColor from "./components/ModalCapturedColor";
import { useColorCapturerByUser } from "./composables/useColorCapturerByUser";

const isModalCapturedColorVisible = ref<boolean>(false);
const isFrontCamera = ref<boolean>(false);

const {
  liveColorHex,
  capturedColorHexByUser,
  capturedColorNameByUser,
  captureColorByUser,
  setLiveColor,
} = useColorCapturerByUser(showModalCapturedColor);

function showModalCapturedColor() {
  isModalCapturedColorVisible.value = true;
}

function flipCamera() {
  isFrontCamera.value = !isFrontCamera.value;
}
</script>
