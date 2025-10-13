import { ref, onMounted, onUnmounted, Ref } from "vue";
import * as config from "../constants/config";

export function useCamera(
  isFrontCamera: boolean,
  videoRef: Ref<HTMLVideoElement | null>,
) {
  const capturedImage = ref<ImageCapture | null>(null);
  const mediaStream = ref<MediaStream | undefined>(undefined);

  const isCameraShown = ref<boolean>(false);

  onMounted(() => {
    if (config.IS_CAMERA_ENABLED) {
      startCamera();
    }
  });

  onUnmounted(() => {
    if (config.IS_CAMERA_ENABLED) {
      stopCamera();
    }
  });

  function restartCamera() {
    if (config.IS_CAMERA_ENABLED) {
      stopCamera();
      startCamera();
    }
  }

  async function startCamera() {
    try {
      mediaStream.value = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
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

  return { capturedImage, isCameraShown, restartCamera };
}
