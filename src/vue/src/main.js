import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import AsyncComputed from "vue-async-computed";

const app = createApp(App);

import Autocomplete from "@trevoreyre/autocomplete-vue";
import "@trevoreyre/autocomplete-vue/dist/style.css";

app.use(Autocomplete);
app.use(createPinia());
app.use(router);
app.use(AsyncComputed);

app.mount("#app");
