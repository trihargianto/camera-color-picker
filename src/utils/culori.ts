// culori's `fn` entry point only includes the color spaces we register here,
// which keeps the bundle small. Import culori helpers from this file.
import {
  useMode,
  modeRgb,
  modeLrgb,
  modeLab65,
  converter,
  nearest,
  differenceCiede2000,
} from "culori/fn";

useMode(modeRgb); // sRGB and hex colors
useMode(modeLrgb); // linear RGB, used for white balance
useMode(modeLab65); // CIELAB, used by CIEDE2000

export { converter, nearest, differenceCiede2000 };
