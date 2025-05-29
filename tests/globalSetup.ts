import type { TestProject } from "vitest/node";
import orquestrator from "~/infra/orquestrator";

export default async function start(_: TestProject) {
  await orquestrator.waitForWebServer();
}
