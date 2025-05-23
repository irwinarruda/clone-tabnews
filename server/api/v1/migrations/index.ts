import type { EventHandlerRequest, H3Event } from "h3";
import type { RunnerOption } from "node-pg-migrate";
import migrationRunner from "node-pg-migrate";
import { serverEnv } from "~/config/server-env";
import path from "path";

const migrationRunnerDTO: RunnerOption = {
  databaseUrl: serverEnv.PgDatabaseUrl,
  dir: path.join("infra", "migrations"),
  migrationsTable: "pgmigrations",
  direction: "up",
  dryRun: true,
  noLock: true,
};

async function get(_: H3Event<EventHandlerRequest>) {
  const migrations = migrationRunner(migrationRunnerDTO);
  return migrations;
}

async function post(event: H3Event<EventHandlerRequest>) {
  const migrations = await migrationRunner({
    ...migrationRunnerDTO,
    dryRun: false,
  });
  if (migrations.length > 0) {
    setResponseStatus(event, 201);
  }
  return migrations;
}

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case "GET":
      return get(event);
    case "POST":
      return post(event);
    default:
      return setResponseStatus(event, 405);
  }
});
