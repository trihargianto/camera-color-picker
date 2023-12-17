import type { Meta, StoryObj } from "@storybook/vue3";

import CameraControl from "./CameraControl.vue";

const meta: Meta<typeof CameraControl> = {
  component: CameraControl,
};

export default meta;

type Story = StoryObj<typeof CameraControl>;

export const Default: Story = {
  render: (args) => ({
    components: { CameraControl },
    setup() {
      return { args };
    },
    template: '<CameraControl v-bind="args" />',
  }),
};
