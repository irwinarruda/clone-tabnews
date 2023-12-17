test('GET to /api/v1/status should return 200', async function () {
	const response = await fetch('http://localhost:5173/api/v1/status');
	expect(response.status).toBe(200);
	const body = await response.json();
	expect(body.updated_at).toBeDefined();
	expect(body.updated_at).toBe(new Date(body.updated_at).toISOString());
	expect(body.dependencies).toBeDefined();
	const database = body.dependencies.database;
	expect(database).toBeDefined();
	expect(database.version).toBeDefined();
	expect(Number(database.version.split('.')[0])).toBeGreaterThanOrEqual(0);
	expect(database.max_connections).toBeDefined();
	expect(database.max_connections).toBeGreaterThanOrEqual(0);
	expect(database.open_connections).toBeDefined();
	expect(database.open_connections).toBe(1);
	expect(database.open_connections <= database.max_connections).toBeTruthy();
});
