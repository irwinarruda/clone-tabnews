describe('/api/v1/migrations', function () {
	test('GET should return 200', async function () {
		const response = await fetch('http://localhost:5173/api/v1/migrations');
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(Array.isArray(body)).toBe(true);
		console.log(body);
	});
});
