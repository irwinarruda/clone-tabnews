function somar(num1: number, num2: number) {
	if (typeof num1 !== 'number' || typeof num2 !== 'number') {
		return 'Erro';
	}
	return num1 + num2;
}

function multiplicar(num1: number, num2: number) {
	return num1 * num2;
}

export default { somar, multiplicar };
