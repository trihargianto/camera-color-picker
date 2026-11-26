import type { Meta, StoryObj } from "@storybook/vue3";

import ModalCapturedColor from "./ModalCapturedColor.vue";

const meta: Meta<typeof ModalCapturedColor> = {
  component: ModalCapturedColor,
  parameters: {
    // The modal opens with `showModal()`, so render each story in its own
    // iframe. Otherwise several modals stack and block the docs page.
    docs: { story: { inline: false, iframeHeight: 500 } },
  },
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
    isLoading: false,
    errorMessage: null,
  },
  argTypes: {
    colorHex: { control: "color" },
  },
};

export const Loading: Story = {
  ...Default,
  args: { ...Default.args, colorName: null, isLoading: true },
};

export const WithError: Story = {
  ...Default,
  args: {
    ...Default.args,
    colorName: "Unknown Color",
    errorMessage:
      "Could not fetch color name. Please check your internet connection and try again.",
  },
};
