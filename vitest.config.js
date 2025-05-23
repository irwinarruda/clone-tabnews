/// <reference types="vitest/globals" />
import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    globals: true,
    setupFiles: ["dotenv/config"],
    sequence: {
      concurrent: false,
    },
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
