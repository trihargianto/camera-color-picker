import type { Meta, StoryObj } from "@storybook/vue3";

import ModalCapturedColor from "./ModalCapturedColor.vue";

const meta: Meta<typeof ModalCapturedColor> = {
  component: ModalCapturedColor,
};

export default meta;

type Story = StoryObj<typeof ModalCapturedColor>;

export const Default: Story = {
  render: (args) => ({
    components: { ModalCapturedColor },
    setup() {
      return { args };
    },
    template: '<ModalCapturedColor v-bind="args" />',
  }),
  decorators: [
    () => ({ template: '<div style="height: 400px"><story/></div>' }),
  ],
  args: {
    modelValue: true,
    colorHex: "#ff0000",
    colorName: "Red",
  },
  argTypes: {
    colorHex: { control: "color" },
  },
};
