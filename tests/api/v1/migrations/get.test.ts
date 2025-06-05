import database from "~/infra/database";

describe("get /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    beforeAll(async () => {
      await database.sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`;
      response = await fetch("http://localhost:3000/api/v1/migrations");
      body = await response.json();
    });
    test("Getting pending migrations", () => {
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
