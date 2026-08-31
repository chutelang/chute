import DefaultTheme from "vitepress/theme";
import ChuteCode from "./components/ChuteCode.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ChuteCode", ChuteCode);
  },
};
