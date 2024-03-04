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

const query = async function (queryObject: any, option1?: any) {
	const client = new db.Client({
		host: env.POSTGRES_HOST,
		port: Number(env.POSTGRES_PORT),
		user: env.POSTGRES_USER,
		database: env.POSTGRES_DB,
		password: env.POSTGRES_PASSWORD,
		ssl: getSSLValues()
	});
	try {
		await client.connect();
		const result = await client.query(queryObject, option1);
		return result;
	} finally {
		await client.end();
	}
} as db.ClientBase['query'];

const sql = async function (literal: TemplateStringsArray, ...params: any) {
	return query(sqlJoin(literal), params);
};

export default {
	query,
	sql
};
