<script setup lang="ts">
import { ref, onMounted } from "vue";

defineOptions({
  name: "CameraControl",
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  // getColorFromCanvas();
  openCamera();
});

function getColorFromCanvas() {
  // TODO: The code!
}

function openCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((mediaStream: MediaStream) => {
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream;
      }
    })
    .catch((error) => console.error("getUserMedia() error: ", error));
}
</script>

<template>
  <div><canvas ref="canvasRef" /><video ref="videoRef" autoplay /></div>
</template>
