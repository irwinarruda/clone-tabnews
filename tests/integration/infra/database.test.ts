import database from '~/infra/database';

describe('database', function () {
	beforeEach(async function () {
		await database.sql`DROP TABLE IF EXISTS test;`;
		await database.sql`
      CREATE TABLE test (
        test_id SERIAL PRIMARY KEY,
        test_name VARCHAR(255),
        test_age INTEGER,
        test_created_at TIMESTAMP,
        test_is_deleted BOOLEAN,
        test_nullable VARCHAR(255) NULL
      );
    `;
	});
	test('inserting a string via `sql` should work', async function () {
		const test_name = 'mock_name';
		await database.sql`INSERT INTO test (test_name) VALUES (${test_name});`;
		const col = await database.sql`SELECT test_name FROM test WHERE test_name = ${test_name};`;
		expect(col.rows[0].test_name).toBe(test_name);
		expect(col.rows[0].test_name).not.toBe('another');
	});
	test('inserting an integer via `sql` should work', async function () {
		const test_age = 24;
		await database.sql`INSERT INTO test (test_age) VALUES (${test_age});`;
		const col = await database.sql`SELECT test_age FROM test WHERE test_age = ${test_age};`;
		expect(col.rows[0].test_age).toBe(test_age);
		expect(col.rows[0].test_age).not.toBe(0);
	});
	test('inserting a date via `sql` should work', async function () {
		const test_created_at = new Date();
		await database.sql`INSERT INTO test (test_created_at) VALUES (${test_created_at});`;
		const col =
			await database.sql`SELECT test_created_at FROM test WHERE test_created_at = ${test_created_at};`;
		expect(col.rows[0].test_created_at).toStrictEqual(test_created_at);
		expect(col.rows[0].test_created_at).not.toStrictEqual(new Date());
	});
	test('inserting a boolean via `sql` should work', async function () {
		const test_is_deleted = false;
		await database.sql`INSERT INTO test (test_is_deleted) VALUES (${test_is_deleted});`;
		const col =
			await database.sql`SELECT test_is_deleted FROM test WHERE test_is_deleted = ${test_is_deleted};`;
		expect(col.rows[0].test_is_deleted).toBe(test_is_deleted);
		expect(col.rows[0].test_is_deleted).not.toBe(true);
	});
	test('inserting a null via `sql` should work', async function () {
		const test_nullable = null;
		await database.sql`INSERT INTO test (test_nullable) VALUES (${test_nullable});`;
		const col = await database.sql`SELECT * FROM test`;
		expect(col.rows.length).toBe(1);
		expect(col.rows[0].test_nullable).toBe(null);
		expect(col.rows[0].test_nullable).not.toBe(undefined);
	});
	test('inserting multiple values via `sql` should work', async function () {
		const test_name = 'mock_name';
		const test_age = 24;
		const test_created_at = new Date();
		const test_is_deleted = false;
		const test_nullable = null;
		await database.sql`
      INSERT INTO test (test_name, test_age, test_created_at, test_is_deleted, test_nullable )
      VALUES (${test_name}, ${test_age}, ${test_created_at}, ${test_is_deleted}, ${test_nullable});
    `;
		const col = await database.sql`SELECT * FROM test;`;
		expect(col.rows[0]).toStrictEqual({
			test_id: 1,
			test_name,
			test_age,
			test_created_at,
			test_is_deleted,
			test_nullable
		});
	});
	test('inserting sql injection string via `sql` should not work', async function () {
		const injection = "'');INSERT INTO test (test_name) VALUES ('injection'";
		await database.sql`INSERT INTO test (test_name) VALUES (${injection});`;
		const col = await database.sql`SELECT * FROM test`;
		expect(col.rows.length).toBe(1);
		expect(col.rows[0].test_name).toBe(injection);
	});
	afterEach(async function () {
		await database.sql`DROP TABLE IF EXISTS test;`;
	});
});
