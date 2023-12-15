<template>
  <div class="container mx-auto">
    <div class="w-full flex justify-center">
      <canvas ref="canvasRef" />

      <div class="relative">
        <ColorTooltip :hex-color="capturedColorHex" />

        <video ref="videoRef" autoplay playsinline class="w-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, Ref } from "vue";

import { rgbToHex } from "../utils/rgbToHex";
import ColorTooltip from "./ColorTooltip.vue";

defineOptions({
  name: "CameraControl",
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { capturedImage } = useCamera();
const { capturedColorHex } = useColorCapture(capturedImage);

function useCamera() {
  const capturedImage = ref<ImageCapture | null>(null);

  onMounted(async () => {
    const mediaStream = await openCamera();

    setCapturedImage(mediaStream);
    setVideoSrcObject(mediaStream);
  });

  function setCapturedImage(mediaStream: MediaStream | undefined) {
    if (mediaStream) {
      const mediaStreamTrack = mediaStream.getVideoTracks()[0];

      capturedImage.value = new ImageCapture(mediaStreamTrack);
    }
  }

  function setVideoSrcObject(mediaStream: MediaStream | undefined) {
    if (mediaStream && videoRef.value) {
      videoRef.value.srcObject = mediaStream;
    }
  }

  async function openCamera(): Promise<MediaStream | undefined> {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      return mediaStream;
    } catch (error) {
      console.error("getUserMedia() error: ", error);
    }
  }

  return { capturedImage };
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
            1
          ).data;

          capturedColor.value = { r, g, b };
        }
      }
    } catch (error) {
      console.error("setRGBColorFromCanvas() error: ", error);
    }
  }

  return { capturedColorHex };
}
</script>
