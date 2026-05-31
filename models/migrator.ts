import { runner } from "node-pg-migrate";
import type { MigrationDirection } from "node-pg-migrate/runner";
import database from "~/infra/database";
import { ServiceError } from "~/infra/errors";
import { migrationsDir } from "~/infra/paths";

type MigrateOptions = {
  count?: number;
};

async function migrate(
  dryRun: boolean,
  direction: MigrationDirection,
  options?: MigrateOptions,
) {
  const client = await database.getClient();
  try {
    return await runner({
      dbClient: client,
      dir: migrationsDir(),
      migrationsTable: "pgmigrations",
      direction,
      noLock: true,
      log: () => void 0,
      dryRun,
      ...(options?.count !== undefined && { count: options.count }),
    });
  } catch (err) {
    throw new ServiceError(err as Error, "Error running migrations.");
  } finally {
    await client.end();
  }
}

async function listPendingMigrations() {
  return migrate(true, "up");
}

async function runPendingMigrations() {
  return migrate(false, "up");
}

async function resetMigrations() {
  const toRollback = await migrate(true, "down");
  if (toRollback.length === 0) return [];
  return migrate(false, "down", { count: toRollback.length });
}

export default {
  listPendingMigrations,
  runPendingMigrations,
  resetMigrations,
};
