import type { EventHandlerRequest, H3Event } from "h3";
import { runner } from "node-pg-migrate";
import database from "~/infra/database";
import { pathEnv } from "~/config/path-env";
import type { MigrationDirection } from "node-pg-migrate/runner";

async function migrate(dryRun: boolean, direction: MigrationDirection = "up") {
  const client = await database.getClient();
  try {
    const migrations = await runner({
      dbClient: client,
      dir: pathEnv.migrations,
      migrationsTable: "pgmigrations",
      direction: direction,
      dryRun: dryRun,
    });
    return migrations;
  } finally {
    await client.end();
  }
}

async function onGet(_: H3Event<EventHandlerRequest>) {
  const migrations = await migrate(true);
  return migrations;
}

async function onPost(event: H3Event<EventHandlerRequest>) {
  const migrations = await migrate(false);
  if (migrations.length > 0) {
    setResponseStatus(event, 201);
  }
  return migrations;
}

async function onDelete(event: H3Event<EventHandlerRequest>) {
  const migrations = await migrate(false, "down");
  if (migrations.length === 0) {
    setResponseStatus(event, 204);
  }
  return migrations;
}

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case "GET":
      return onGet(event);
    case "POST":
      return onPost(event);
    case "DELETE":
      return onDelete(event);
    default:
      return setResponseStatus(event, 405);
  }
});
