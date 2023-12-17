import { env } from '$env/dynamic/private';
import { Client, ClientBase } from 'pg';

const query = async function (queryObject: any) {
	const client = new Client({
		host: env.POSTGRES_HOST,
		port: Number(env.POSTGRES_PORT),
		user: env.POSTGRES_USER,
		database: env.POSTGRES_DB,
		password: env.POSTGRES_PASSWORD
	});
	await client.connect();
	const result = await client.query(queryObject);
	await client.end();
	return result;
} as ClientBase['query'];

export default {
	query
};
