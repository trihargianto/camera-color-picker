# <img src="src/assets/what-color-logo.png" width="30" /> Camera Color Picker

![Kapture 2023-12-17 at 18 21 07](https://github.com/trihargianto/camera-color-picker/assets/18502234/90d33fc5-3208-46bc-8fcf-0d7222b01692)

This tool aims to answer "What Color is this?" question.

But why on earth this tool was built in the first place? This is because I need a tool to help a [color-blind](https://en.wikipedia.org/wiki/Color_blindness) person like me to recognize color in this world easily by using Camera.

## Live

📸 Demo: [camera-color-picker.vercel.app](https://camera-color-picker.vercel.app/)

📓 Storybook: [camera-color-picker-storybook.vercel.app](https://camera-color-picker-storybook.vercel.app/)

## How it works

- The app averages a small square under the picker point, which starts at the center of the camera view.
- Tap anywhere in the view to move the point there, or drag anywhere to move it without covering it with your finger. Arrow keys move it too.
- Tap **Freeze** to hold the current frame, then tap or drag to read any spot without keeping the phone still. A white ring and a "Frozen" badge show it is not live. Tap **Freeze** again to go back. **Center** returns the point to the middle.
- The color is named offline: [culori](https://culori.js.org) picks the closest entry in `src/constants/color-names.ts` using CIEDE2000, a formula for how different two colors look to the human eye. Edit that list to change the names.
- Lighting tints everything (warm bulbs make white look yellow). Point the camera at something white or gray, like paper, and tap **Calibrate** to cancel the tint. Tap it again to turn it off when the lighting changes.

## Local Installation

Requires Node.js 22 (see `.nvmrc`) and [pnpm](https://pnpm.io) (enable it with `corepack enable`).

```
pnpm install
pnpm dev
```

The camera only works on `localhost` or over HTTPS. Set `VITE_CAMERA_ENABLED=false` in a `.env.local` file to run the app without asking for camera access.

## Scripts

| Command          | What it does                        |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | Start the development server        |
| `pnpm build`     | Type-check and build for production |
| `pnpm test`      | Run unit tests                      |
| `pnpm lint`      | Lint with ESLint                    |
| `pnpm format`    | Format with Prettier                |
| `pnpm storybook` | Start Storybook on port 6006        |

## References

- [Extracting a color palette from an image with javascript](https://dev.to/producthackers/creating-a-color-palette-with-javascript-44ip)
- [CanvasRenderingContext2D: getImageData() method](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
