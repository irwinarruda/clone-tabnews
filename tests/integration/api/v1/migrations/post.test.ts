import path from 'node:path';
import fs from 'node:fs/promises';
import database from '~/infra/database';

async function cleanDatabase() {
	await database.sql`DROP SCHEMA public CASCADE;`;
	await database.sql`CREATE SCHEMA public;`;
}

beforeAll(cleanDatabase);

test('POST to /api/v1/migrations should return 201 and run the migrations', async function () {
	const response = await fetch('http://localhost:5173/api/v1/migrations', { method: 'POST' });
	expect(response.status).toBe(201);
	const body = await response.json();
	expect(Array.isArray(body)).toBe(true);
	expect(body.length).toBeGreaterThan(0);

	const dirs = await fs.readdir(path.join('infra', 'migrations'));
	expect(dirs.length).toBeGreaterThan(0);
	for (const index in dirs) {
		const fileType = '.js';
		const [fileName] = dirs[index].split(fileType);
		expect(body[index]).toHaveProperty('path');
		expect(body[index].path.endsWith(fileName + fileType)).toBeTruthy();
		expect(body[index]).toHaveProperty('name');
		expect(body[index].name).toBe(fileName);
	}

	const secondResponse = await fetch('http://localhost:5173/api/v1/migrations', { method: 'POST' });
	expect(secondResponse.status).toBe(200);
	const secondBody = await secondResponse.json();
	expect(Array.isArray(secondBody)).toBe(true);
	expect(secondBody.length).toEqual(0);
});
