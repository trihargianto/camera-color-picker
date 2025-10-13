import { fn } from "@storybook/test";
import type { Meta, StoryObj } from "@storybook/vue3";

import CameraActionButtons from "./CameraActionButtons.vue";

const meta: Meta<typeof CameraActionButtons> = {
  component: CameraActionButtons,
};

export default meta;

type Story = StoryObj<typeof CameraActionButtons>;

export const Default: Story = {
  render: (args) => ({
    components: { CameraActionButtons },
    setup() {
      const onClickShutterButton = fn();
      const onClickFlipCameraButton = fn();
      const onClickCapturedColorButton = fn();

      return {
        args,
        onClickShutterButton,
        onClickFlipCameraButton,
        onClickCapturedColorButton,
      };
    },
    template: `
      <CameraActionButtons 
        v-bind="args" 
        @on-click-shutter-button="onClickShutterButton" 
        @on-click-flip-camera-button="onClickFlipCameraButton" 
        @on-click-captured-color-button="onClickCapturedColorButton" 
      />`,
  }),
  argTypes: {
    capturedColorHexByUser: { control: "color" },
  },
};
