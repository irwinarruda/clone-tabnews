import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import database from '~/infra/database';
import type { RequestHandler } from './$types';

export type GetStatusResponse = {
	updated_at: string;
	dependencies: {
		database: {
			version: string;
			max_connections: number;
			open_connections: number;
		};
	};
};

export const GET: RequestHandler = async function () {
	const updatedAt = new Date().toISOString();
	const databaseVersion = await database.sql`SHOW SERVER_VERSION;`;
	const databaseConn = await database.sql`SHOW MAX_CONNECTIONS;`;
	const databaseOpenConn = await database.sql`
    SELECT COUNT(*)::int FROM PG_STAT_ACTIVITY WHERE datname = ${env.POSTGRES_DB};
  `;
	const respose: GetStatusResponse = {
		updated_at: updatedAt,
		dependencies: {
			database: {
				version: databaseVersion.rows[0].server_version,
				max_connections: Number(databaseConn.rows[0].max_connections),
				open_connections: databaseOpenConn.rows[0].count
			}
		}
	};

	return json(respose, { status: 200 });
};
