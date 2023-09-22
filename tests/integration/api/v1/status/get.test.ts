test('GET to /api/v1/status should return 200', async () => {
	const response = await fetch('http://localhost:5173/api/v1/status');
	expect(response.status).toBe(200);
});
