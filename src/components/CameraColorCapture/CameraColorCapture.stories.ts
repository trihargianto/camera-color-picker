import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/vue3";

import CameraColorCapture from "./CameraColorCapture.vue";

const meta: Meta<typeof CameraColorCapture> = {
  component: CameraColorCapture,
};

export default meta;

type Story = StoryObj<typeof CameraColorCapture>;

export const Default: Story = {
  render: (args) => ({
    components: { CameraColorCapture },
    setup() {
      const onColorCaptured = action("on-color-captured");

      return { args, onColorCaptured };
    },
    template:
      '<CameraColorCapture v-bind="args" @on-color-captured="onColorCaptured" />',
  }),
  args: {
    isFrontCamera: true,
  },
};
