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
	const databaseData = await database.query(`
    SHOW SERVER_VERSION;
    SHOW MAX_CONNECTIONS;
    SELECT COUNT(*)::int FROM PG_STAT_ACTIVITY WHERE datname = 'local_db';
  `);
	const respose: GetStatusResponse = {
		updated_at: updatedAt,
		dependencies: {
			database: {
				version: databaseData[0].rows[0].server_version,
				max_connections: Number(databaseData[1].rows[0].max_connections),
				open_connections: databaseData[2].rows[0].count
			}
		}
	};

	return json(respose, { status: 200 });
};
