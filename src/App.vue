<template>
  <main class="flex h-full w-full flex-col justify-center bg-black">
    <AppLogo />

    <div class="container mx-auto flex flex-col items-center justify-center">
      <CameraColorCapture
        :is-front-camera="isFrontCamera"
        @on-color-captured="setLiveColorHex"
      />

      <CameraActionButtons
        :captured-color-hex-by-user="capturedColorHexByUser"
        :is-shutter-disabled="!liveColorHex"
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
  setLiveColorHex,
} = useColorCapturerByUser(showModalCapturedColor);

function showModalCapturedColor() {
  isModalCapturedColorVisible.value = true;
}

function flipCamera() {
  isFrontCamera.value = !isFrontCamera.value;
}
</script>
