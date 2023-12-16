<template>
  <div class="container mx-auto flex justify-center">
    <div
      class="flex w-full flex-col items-center justify-center px-6 sm:w-[600px]"
    >
      <canvas ref="canvasRef" class="hidden" />

      <div
        class="relative flex aspect-square w-full items-center justify-center rounded-2xl border sm:rounded-xl"
      >
        <ColorTooltip v-if="isCameraShown" :hex-color="capturedColorHex">
          {{ capturedColorName }}
        </ColorTooltip>

        <p v-if="!isCameraShown" class="z-1 absolute">Initializing camera...</p>

        <video
          ref="videoRef"
          autoplay
          playsinline
          class="z-2 absolute rounded-2xl sm:rounded-xl"
        />
      </div>

      <button
        class="mt-4 inline-flex w-24 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-32 sm:text-sm"
        @click="flipCamera()"
      >
        Flip Camera
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, Ref } from "vue";

import { hexToColorName } from "../utils/hex-to-color-name";
import { rgbToHex } from "../utils/rgb-to-hex.ts";
import ColorTooltip from "./ColorTooltip.vue";

defineOptions({
  name: "CameraControl",
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { capturedImage, isCameraShown, flipCamera } = useCamera();
const { capturedColorName, capturedColorHex } = useColorCapture(capturedImage);

function useCamera() {
  const isFrontCamera = ref<boolean>(false);
  const capturedImage = ref<ImageCapture | null>(null);
  const mediaStream = ref<MediaStream | undefined>(undefined);

  const isCameraShown = ref<boolean>(false);

  onMounted(() => {
    startCamera();
  });

  function flipCamera() {
    isFrontCamera.value = !isFrontCamera.value;

    restartCamera();
  }

  function restartCamera() {
    stopCamera();
    startCamera();
  }

  async function startCamera() {
    try {
      mediaStream.value = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera.value ? "user" : "environment",
          width: 1280,
          height: 1280,
        },
      });

      setCapturedImage();
      setVideoSrcObject();

      isCameraShown.value = true;
    } catch (error) {
      console.error("getUserMedia() error: ", error);
    }
  }

  function stopCamera() {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop());
    }

    if (capturedImage.value) {
      capturedImage.value = null;
    }

    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }

    isCameraShown.value = false;
  }

  function setCapturedImage() {
    if (mediaStream.value) {
      const mediaStreamTrack = mediaStream.value.getVideoTracks()[0];

      capturedImage.value = new ImageCapture(mediaStreamTrack);
    }
  }

  function setVideoSrcObject() {
    if (mediaStream.value && videoRef.value) {
      videoRef.value.srcObject = mediaStream.value;
    }
  }

  return { capturedImage, isCameraShown, flipCamera };
}

function useColorCapture(capturedImage: Ref<ImageCapture | null>) {
  const capturedColor = ref<{ r: number; g: number; b: number }>({
    r: 0,
    g: 0,
    b: 0,
  });

  const capturedColorHex = computed(() => {
    const { r, g, b } = capturedColor.value;

    return rgbToHex(r, g, b);
  });

  const capturedColorName = computed(() => {
    return hexToColorName(capturedColorHex.value);
  });

  const intervalId = ref<number | null>(null);

  onMounted(() => {
    intervalId.value = setInterval(() => {
      setRGBColorFromCanvas();
    }, 500);
  });

  onUnmounted(() => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
    }
  });

  async function setRGBColorFromCanvas() {
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
      console.error("setRGBColorFromCanvas() error: ", error);
    }
  }

  return { capturedColorName, capturedColorHex };
}
</script>
