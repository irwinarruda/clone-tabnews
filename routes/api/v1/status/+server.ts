import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return json({ status: 'Alunos do curso.dev são pessoas acima da média' }, { status: 200 });
};
