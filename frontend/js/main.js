import { ComponentLoader } from "./core/loader.js";
import { initializeApp } from "./modules/app.js";

const components = {
  "slot-header": "views/layout/header.html",
  "slot-strategy": "views/input/strategy.html",
  "slot-tabs": "views/input/tabs.html",
  "slot-form": "views/input/form_single.html",
  "slot-staging": "views/input/staging.html",
  "slot-loading": "views/output/loader.html",
  "slot-error": "views/output/error.html",
  "slot-results": "views/output/empty_state.html",
};

document.addEventListener("DOMContentLoaded", async () => {
  const loader = new ComponentLoader(components);
  await loader.loadAll();

  initializeApp();
});
