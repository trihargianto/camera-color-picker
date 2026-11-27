import { ref, onMounted, onUnmounted, watch, type Ref } from "vue";
import * as config from "../constants/config";

const CAMERA_START_TIMEOUT_MS = 30_000;

export type CameraStatus = "idle" | "starting" | "ready" | "error" | "disabled";

function getCameraErrorMessage(error: unknown) {
  if (!window.isSecureContext) {
    return "Camera needs a secure (HTTPS) connection.";
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return "This browser does not support camera access.";
  }

  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
        return "Camera access was denied. Allow it in your browser settings and reload the page.";
      case "NotFoundError":
      case "OverconstrainedError":
        return "No camera was found on this device.";
      case "NotReadableError":
        return "The camera is being used by another app.";
    }
  }

  return "Could not start the camera.";
}

export function useCamera(
  isFrontCamera: () => boolean,
  videoRef: Ref<HTMLVideoElement | null>,
) {
  const status = ref<CameraStatus>(
    config.IS_CAMERA_ENABLED ? "idle" : "disabled",
  );
  const errorMessage = ref<string | null>(null);

  let mediaStream: MediaStream | null = null;
  let startupTimer: number | undefined;

  // Incremented on every start/stop so a slow `getUserMedia` call that resolves
  // after a newer start (or after unmount) can be detected and discarded.
  let requestId = 0;

  onMounted(() => {
    if (config.IS_CAMERA_ENABLED) {
      startCamera();
    }
  });

  onUnmounted(stopCamera);

  watch(isFrontCamera, () => {
    if (config.IS_CAMERA_ENABLED) {
      startCamera();
    }
  });

  async function startCamera() {
    stopCamera();

    const currentRequestId = requestId;
    startupTimer = window.setTimeout(() => {
      stopCamera();
      status.value = "error";
      errorMessage.value =
        "Camera startup timed out. Check camera permission in your browser and try again.";
    }, CAMERA_START_TIMEOUT_MS);

    status.value = "starting";
    errorMessage.value = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera() ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });

      if (currentRequestId !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStream = stream;

      const video = videoRef.value;
      if (!video) {
        throw new Error("Camera preview is unavailable.");
      }

      video.srcObject = stream;
      await video.play();

      if (currentRequestId !== requestId) {
        return;
      }

      window.clearTimeout(startupTimer);

      status.value = "ready";
    } catch (error) {
      if (currentRequestId !== requestId) {
        return;
      }

      console.error("Camera startup failed", error);
      const message =
        mediaStream &&
        error instanceof DOMException &&
        error.name === "NotAllowedError"
          ? "Camera playback was blocked. Tap Try again to restart the preview."
          : getCameraErrorMessage(error);
      stopCamera();

      status.value = "error";
      errorMessage.value = message;
    }
  }

  function stopCamera() {
    requestId++;
    window.clearTimeout(startupTimer);

    mediaStream?.getTracks().forEach((track) => track.stop());
    mediaStream = null;

    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }

    if (status.value !== "disabled") {
      status.value = "idle";
    }
  }

  return { status, errorMessage, startCamera };
}
