import calculadora from '~/models/calculadora';

test('somar 2 + 2 deve retornar 4', () => {
	const resultado = calculadora.somar(2, 2);
	expect(resultado).toBe(4);
});

test('somar 5 + 100 deve retornar 105', () => {
	const resultado = calculadora.somar(5, 100);
	expect(resultado).toBe(105);
});

test('somar "banana" com 100 deve retornar "Erro"', () => {
	const resultado = calculadora.somar('banana' as unknown as number, 100);
	expect(resultado).toBe('Erro');
});

test('multiplicar 2 * 2 deve retornar 2', () => {
	const resultado = calculadora.multiplicar(2, 2);
	expect(resultado).toBe(4);
});

test('multiplicar 5 * 100 deve retornar 500', () => {
	const resultado = calculadora.multiplicar(5, 100);
	expect(resultado).toBe(500);
});
