import type { Meta, StoryObj } from "@storybook/vue3";

import ColorTooltip from "./ColorTooltip.vue";

const meta: Meta<typeof ColorTooltip> = {
  component: ColorTooltip,
};

export default meta;

type Story = StoryObj<typeof ColorTooltip>;

export const Default: Story = {
  render: (args) => ({
    components: { ColorTooltip },
    setup() {
      return { args };
    },
    template: '<ColorTooltip v-bind="args" />',
  }),
  decorators: [
    () => ({ template: '<div style="margin: 4em;"><story/></div>' }),
  ],
  args: {
    hexColor: "#f00",
  },
};
