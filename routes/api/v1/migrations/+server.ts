import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import migrationsRunner from 'node-pg-migrate';
import path from 'node:path';
import database from '~/infra/database';
import type { RequestHandler } from './$types';

const config = {
	databaseUrl: env.DATABASE_URL,
	dir: path.join('infra', 'migrations'),
	direction: 'up' as const,
	migrationsTable: 'pgmigrations',
	verbose: true
};

export const GET: RequestHandler = async function () {
	const client = await database.getNewClient();
	try {
		const pendingMigrations = await migrationsRunner({
			...config,
			dbClient: client,
			dryRun: true
		});
		return json(pendingMigrations, { status: 200 });
	} catch (err: any) {
		return json(err.message, { status: 500 });
	} finally {
		await client.end();
	}
};

export const POST: RequestHandler = async function () {
	const client = await database.getNewClient();
	try {
		const migratedMigrations = await migrationsRunner({
			...config,
			dbClient: client,
			dryRun: false
		});
		if (migratedMigrations.length > 0) {
			return json(migratedMigrations, { status: 201 });
		}
		return json(migratedMigrations, { status: 200 });
	} catch (_) {
		return json(undefined, { status: 500 });
	} finally {
		await client.end();
	}
};
