test("get to /api/v1/status should return status 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.message).toBe(5);
});
