import { env } from '$env/dynamic/private';
import db from 'pg';

const sqlJoin = function <T extends string[] | ReadonlyArray<string>>(str: T) {
	return str.reduce((acc, part, i) => acc + part + (i !== str.length - 1 ? `$${i + 1}` : ''), '');
};

const getSSLValues = function () {
	if (env.POSTGRES_CA) {
		return {
			ca: env.POSTGRES_CA
		};
	}
	return env.NODE_ENV === 'production';
};

const getNewClient = async function () {
	const client = new db.Client({
		host: env.POSTGRES_HOST,
		port: Number(env.POSTGRES_PORT),
		user: env.POSTGRES_USER,
		database: env.POSTGRES_DB,
		password: env.POSTGRES_PASSWORD,
		ssl: getSSLValues()
	});
	await client.connect();
	return client;
};

const query = async function (queryObject: any, option1?: any) {
	let client: db.Client;
	try {
		client = await getNewClient();
		const result = await client.query(queryObject, option1);
		return result;
	} catch (err) {
		console.log(err);
	} finally {
		await client!.end();
	}
} as db.ClientBase['query'];

const sql = async function (literal: TemplateStringsArray, ...params: any) {
	return query(sqlJoin(literal), params);
};

export default {
	query,
	sql,
	getNewClient
};
