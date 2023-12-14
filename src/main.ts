import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

// https://github.com/GoogleChromeLabs/imagecapture-polyfill
import "image-capture";

createApp(App).mount("#app");
