import type { Meta, StoryObj } from "@storybook/vue3";

import AppLogo from "./AppLogo.vue";

const meta: Meta<typeof AppLogo> = {
  component: AppLogo,
};

export default meta;

type Story = StoryObj<typeof AppLogo>;

export const Default: Story = {
  render: () => ({
    components: { AppLogo },
    template: "<AppLogo />",
  }),
};
