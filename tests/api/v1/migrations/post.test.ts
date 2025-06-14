import orquestrator from "~/infra/orquestrator";

describe("post /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    beforeAll(async () => {
      await orquestrator.clearDatabase();
    });
    test("Running pending migrations UP", async () => {
      response = await getResponse();
      body = await response.json();
      expect(response.status).toBe(201);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      response = await getResponse();
      body = await response.json();
      expect(response.status).toBe(200);
      expect(body.length).toBe(0);
    });
  });
});

async function getResponse() {
  return fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
}
