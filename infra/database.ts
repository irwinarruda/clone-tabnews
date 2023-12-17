import { env } from '$env/dynamic/private';
import * as db from 'pg';

const query = async function (queryObject: any, option1?: any) {
	const client = new db.Client({
		host: env.POSTGRES_HOST,
		port: Number(env.POSTGRES_PORT),
		user: env.POSTGRES_USER,
		database: env.POSTGRES_DB,
		password: env.POSTGRES_PASSWORD
	});
	await client.connect();
	const result = await client.query(queryObject, option1);
	await client.end();
	return result;
} as db.ClientBase['query'];

export default {
	query
};
