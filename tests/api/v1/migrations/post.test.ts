import database from "~/infra/database";

describe("post /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    async function getResponse() {
      return fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
    }
    beforeAll(async () => {
      await database.sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`;
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
