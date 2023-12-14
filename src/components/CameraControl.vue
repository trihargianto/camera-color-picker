<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "CameraControl",
});

const imageRef = ref<HTMLImageElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const capturedImage = ref<any>();

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
      window.alert(error);
      console.error("getUserMedia() error: ", error);
    });
}

function captureCamera() {
  capturedImage.value
    .takePhoto()
    .then((blob: Blob) => {
      if (imageRef.value) {
        imageRef.value.src = URL.createObjectURL(blob);
        // @ts-ignore-next
        imageRef.value.onload = () => URL.revokeObjectURL(imageRef.value.src);
      }
    })
    .catch((error: any) => {
      window.alert(error);
      console.error("takePhoto() error: ", error);
    });
}

function captureCanvas() {
  const canvas = canvasRef.value;

  capturedImage.value.grabFrame().then((imageBitmap: ImageBitmap) => {
    if (canvas) {
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      canvas.getContext("2d")?.drawImage(imageBitmap, 0, 0);
    }
  });
}
</script>

<template>
  <div class="container mx-auto pt-10">
    <div class="w-full flex justify-center flex-col items-start lg:">
      <div class="flex mb-6 items-start flex-col sm:flex-row">
        <!-- <img
          ref="imageRef"
          class="w-96 pr-10"
          src="https://placeholder.pics/svg/300x300"
        /> -->
        <div>
          <p>Canvas</p>
          <canvas ref="canvasRef" />
        </div>
        <div>
          <p>Camera</p>
          <video ref="videoRef" autoplay playsinline class="w-full" />
        </div>
      </div>
      <button
        @click="openCamera"
        class="border bg-blue-500 py-3 px-4 text-white rounded-md hover:bg-blue-400"
      >
        Open Camera
      </button>
      <button
        @click="captureCamera"
        class="border bg-blue-500 py-3 px-4 text-white rounded-md hover:bg-blue-400"
      >
        Capture Camera
      </button>
      <button
        @click="captureCanvas"
        class="border bg-blue-500 py-3 px-4 text-white rounded-md hover:bg-blue-400"
      >
        Capture Canvas
      </button>
    </div>
  </div>
</template>
