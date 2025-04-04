import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "./assets/css/style.css";

const app = createApp(App);

const store = createPinia();

app.use(router).use(store).mount("#app");
