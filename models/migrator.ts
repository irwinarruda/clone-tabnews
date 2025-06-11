import { runner } from "node-pg-migrate";
import type { MigrationDirection } from "node-pg-migrate/runner";
import { pathEnv } from "~/config/path-env";
import database from "~/infra/database";
import { ServiceError } from "~/infra/errors";

async function migrate(dryRun: boolean, direction: MigrationDirection) {
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
  } catch (err) {
    throw new ServiceError(err as Error, "Error running migrations.");
  } finally {
    await client.end();
  }
}

async function listPendingMigrations() {
  const migrations = await migrate(true, "up");
  return migrations;
}

async function runPendingMigrations() {
  const migrations = await migrate(false, "up");
  return migrations;
}

async function resetMigrations() {
  const migrations = await migrate(false, "down");
  return migrations;
}

export default {
  listPendingMigrations,
  runPendingMigrations,
  resetMigrations,
};
