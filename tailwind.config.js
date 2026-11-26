/** @type {import('tailwindcss').Config} */
export default {
  future: {
    // Only apply `hover:` styles on devices that can hover, so a tap on a
    // phone does not leave a button stuck in its hover state.
    hoverOnlyWhenSupported: true,
  },
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
