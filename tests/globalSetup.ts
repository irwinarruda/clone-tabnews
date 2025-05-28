import type { TestProject } from "vitest/node";
import orquestrator from "~/infra/orquestrator";

export default async function setup(_: TestProject) {
  await orquestrator.waitForWebServer();
}
