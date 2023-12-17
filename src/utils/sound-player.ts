import cameraShutterSound from "../assets/sounds/camera-shutter-sound.mp3";

export function playCameraShutterSound() {
  const audio = new Audio(cameraShutterSound);

  audio.volume = 0.2;
  audio.play();
}
