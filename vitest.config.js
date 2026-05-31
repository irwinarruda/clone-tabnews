/// <reference types="vitest/globals" />
import { defineVitestConfig } from "@nuxt/test-utils/config";

/** @see https://github.com/nuxt/test-utils/issues/1635 */
const patchPgResolveConditions = {
  name: "patch-pg-resolve-conditions",
  enforce: "post",
  configEnvironment(name, config) {
    if (name === "ssr" && config.resolve?.conditions) {
      config.resolve.conditions = config.resolve.conditions.filter(
        (condition) => condition !== "import",
      );
    }
  },
};

export default defineVitestConfig({
  plugins: [patchPgResolveConditions],
  test: {
    globals: true,
    setupFiles: ["dotenv/config"],
    sequence: {
      concurrent: false,
    },
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 10000,
    globalSetup: ["./tests/globalSetup.ts"],
  },
});
