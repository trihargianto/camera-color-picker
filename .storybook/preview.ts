import type { Preview } from "@storybook/vue3";

import "../src/style.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#000000",
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
