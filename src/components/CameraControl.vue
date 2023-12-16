<template>
  <div class="container mx-auto flex justify-center">
    <div
      class="flex w-full flex-col items-center justify-center px-6 text-white sm:w-[500px]"
    >
      <canvas ref="canvasRef" class="hidden" />

      <div
        class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border"
      >
        <video
          ref="videoRef"
          autoplay
          playsinline
          class="z-2 absolute rounded-2xl"
        />

        <template v-if="isCameraShown">
          <div class="absolute">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <div
            class="absolute bottom-[0] z-10 flex h-9 w-full items-center justify-center rounded-b-2xl text-center text-white"
            :style="`background-color: rgba(${capturedColor.r},${capturedColor.g},${capturedColor.b}, 0.7);`"
          >
            {{ capturedColorHex }} / {{ capturedColorName }}
          </div>
        </template>
        <p v-else class="absolute">Initializing camera...</p>
      </div>

      <div class="my-3 mt-12 flex w-full items-center justify-center gap-14">
        <div
          class="h-11 w-11 cursor-pointer rounded-sm border border-white bg-white"
          :style="`background: ${capturedColorHexByUser}`"
        />

        <div class="flex items-center justify-center rounded-full bg-white p-1">
          <div
            class="h-20 w-20 cursor-pointer rounded-full border-2 border-black bg-white"
            style="
              background: rgb(131, 58, 180);
              background: linear-gradient(
                90deg,
                rgba(131, 58, 180, 1) 0%,
                rgba(253, 29, 29, 1) 50%,
                rgba(252, 176, 69, 1) 100%
              );
            "
            role="button"
            @click="onShutterButtonClick()"
          />
        </div>

        <button
          class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.5)] text-center text-white"
          @click="flipCamera()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, Ref } from "vue";

import { hexToColorName } from "../utils/hex-to-color-name";
import { rgbToHex } from "../utils/rgb-to-hex.ts";

defineOptions({
  name: "CameraControl",
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const capturedColorHexByUser = ref<string | null>(null);

const { capturedImage, isCameraShown, flipCamera } = useCamera();
const { capturedColor, capturedColorName, capturedColorHex } =
  useColorCapture(capturedImage);

function onShutterButtonClick() {
  capturedColorHexByUser.value = capturedColorHex.value;
}

/**
 * COMPOSABLE SPECIFIC TO THIS COMPONENT
 */
function useCamera() {
  const isFrontCamera = ref<boolean>(true);
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

  return { capturedColor, capturedColorName, capturedColorHex };
}
</script>
