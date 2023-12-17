import { json } from '@sveltejs/kit';
import database from '../../../../infra/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const result = await database.query('SELECT 1 + 1;');
	console.log('result', result.rows);
	return json({ status: 'Alunos do curso.dev são pessoas acima da média' }, { status: 200 });
};
