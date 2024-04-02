import path from 'node:path';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import migrationsRunner from 'node-pg-migrate';
import database from '~/infra/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async function (request) {
	const migrations = await migrationsRunner({
		databaseUrl: env.DATABASE_URL,
		dryRun: true,
		dir: path.join('infra', 'migrations'),
		direction: 'up',
		migrationsTable: 'pgmigrations',
		verbose: true
	});
	return json(migrations);
};
