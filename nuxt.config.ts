import tailwindcss from "@tailwindcss/vite";
import { copyPersistAssets } from "./infra/vite/persist";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-30",
  devtools: { enabled: false },
  modules: ["@nuxt/eslint", "@nuxt/test-utils/module", "@nuxt/icon"],
  css: ["~/app.css"],
  vite: { plugins: [tailwindcss()] },
  hooks: {
    close() {
      copyPersistAssets([
        { src: "infra/migrations", dest: "infra/migrations" },
      ]);
    },
  },
});
