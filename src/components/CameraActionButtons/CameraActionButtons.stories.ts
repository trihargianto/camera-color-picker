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
      return { args };
    },
    template: '<CameraActionButtons v-bind="args" />',
  }),
  argTypes: {
    capturedColorHexByUser: { control: "color" },
  },
};
