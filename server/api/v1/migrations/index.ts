import { runner } from "node-pg-migrate";
import database from "~/infra/database";
import { pathEnv } from "~/config/path-env";
import type { MigrationDirection } from "node-pg-migrate/runner";
import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";

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

const router = createNuxtRouter();

router.get(async () => {
  const migrations = await migrate(true);
  return migrations;
});

router.post(async (event) => {
  const migrations = await migrate(false);
  if (migrations.length > 0) {
    setResponseStatus(event, 201);
  }
  return migrations;
});

router.delete(async (event) => {
  const migrations = await migrate(false, "down");
  if (migrations.length === 0) {
    setResponseStatus(event, 204);
  }
  return migrations;
});

export default router.serve(controller.errorHandlers);
