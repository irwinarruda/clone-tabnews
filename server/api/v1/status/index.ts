import { serverEnv } from "~/config/server-env";
import controller from "~/infra/controller";
import database from "~/infra/database";
import { createNuxtRouter } from "~/libs/nuxt-connect";

export interface StatusData {
  updated_at: string;
  dependencies: {
    database: {
      version: string;
      max_connections: number;
      opened_connections: number;
    };
  };
}

type ServerVersion = { server_version: string };
type MaxConnections = { max_connections: string };
type OpenedConnections = { count: string };

const router = createNuxtRouter();

router.get(async () => {
  const version = await database.sql<ServerVersion>`SHOW server_version;`;
  const maxConnections =
    await database.sql<MaxConnections>`SHOW max_connections;`;
  const openedConnections = await database.sql<OpenedConnections>`
    SELECT COUNT(*) FROM pg_stat_activity
    WHERE datname = ${serverEnv.PgDatabase};
  `;
  const updatedAt = new Date().toISOString();
  return {
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version.rows[0].server_version,
        max_connections: parseInt(maxConnections.rows[0].max_connections),
        opened_connections: parseInt(openedConnections.rows[0].count),
      },
    },
  } as StatusData;
});

export default router.serve(controller.errorHandlers);
