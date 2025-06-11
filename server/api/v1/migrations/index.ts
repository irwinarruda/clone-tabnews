import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";
import migrator from "~/models/migrator";

const router = createNuxtRouter();

router.get(async () => {
  const migrations = await migrator.listPendingMigrations();
  return migrations;
});

router.post(async (event) => {
  const migrations = await migrator.runPendingMigrations();
  if (migrations.length > 0) {
    setResponseStatus(event, 201);
  }
  return migrations;
});

router.delete(async (event) => {
  const migrations = await migrator.resetMigrations();
  if (migrations.length === 0) {
    setResponseStatus(event, 204);
  }
  return migrations;
});

export default router.serve(controller.errorHandlers);
