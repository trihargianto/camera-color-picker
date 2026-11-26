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
    template: '<ColorTooltip v-bind="args">Red</ColorTooltip>',
  }),
  decorators: [
    () => ({ template: '<div style="margin: 4em;"><story/></div>' }),
  ],
  args: {
    hexColor: "#FF0000",
    placement: "top",
    arrowOffset: 0,
  },
  argTypes: {
    hexColor: { control: "color" },
    placement: { control: "inline-radio", options: ["top", "bottom"] },
    arrowOffset: { control: { type: "range", min: -50, max: 50 } },
  },
};
