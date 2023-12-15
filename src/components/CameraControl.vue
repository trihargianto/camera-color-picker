<template>
  <div class="container mx-auto">
    <div class="w-full flex justify-center">
      <canvas ref="canvasRef" class="hidden" />

      <div class="relative">
        <ColorTooltip :hex-color="capturedColorHex" />

        <video ref="videoRef" autoplay playsinline class="w-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

import { rgbToHex } from "../utils/rgbToHex";
import ColorTooltip from "./ColorTooltip.vue";

defineOptions({
  name: "CameraControl",
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const capturedImage = ref<any>();
const capturedColor = ref<{ r: number; g: number; b: number }>({
  r: 0,
  g: 0,
  b: 0,
});

const capturedColorHex = computed(() => {
  const { r, g, b } = capturedColor.value;

  return rgbToHex(r, g, b);
});

onMounted(() => {
  openCamera();

  setInterval(() => {
    captureCamera();
  }, 500);
});

function openCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((mediaStream: MediaStream) => {
      const mediaStreamTrack = mediaStream.getVideoTracks()[0];

      // @ts-ignore-next
      capturedImage.value = new ImageCapture(mediaStreamTrack);

      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream;
      }
    })
    .catch((error) => {
      console.error("getUserMedia() error: ", error);
    });
}

function captureCamera() {
  const canvas = canvasRef.value;

  if (canvas && capturedImage.value) {
    capturedImage.value.grabFrame().then((imageBitmap: ImageBitmap) => {
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(imageBitmap, 0, 0);

        const centeredXCoordinate = canvas.width / 2;
        const centeredYCoordinate = canvas.height / 2;

        const imageData = ctx.getImageData(
          centeredXCoordinate,
          centeredYCoordinate,
          1,
          1
        ).data;

        capturedColor.value = {
          r: imageData[0],
          g: imageData[1],
          b: imageData[2],
        };
      }
    });
  }
}
</script>
