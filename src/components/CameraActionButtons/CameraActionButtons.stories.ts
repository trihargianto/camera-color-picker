import { action } from "@storybook/addon-actions";
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
      const onClickShutterButton = action("on-click-shutter-button");
      const onClickFlipCameraButton = action("on-click-flip-camera-button");
      const onClickCapturedColorButton = action(
        "on-click-captured-color-button",
      );

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
