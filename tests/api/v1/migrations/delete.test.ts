import database from "~/infra/database";

describe("delete /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    async function getGetResponse() {
      return fetch("http://localhost:3000/api/v1/migrations");
    }
    async function getPostResponse() {
      return fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
    }
    async function getDeleteResponse() {
      return fetch("http://localhost:3000/api/v1/migrations", {
        method: "DELETE",
      });
    }
    beforeAll(async () => {
      await database.sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`;
    });
    test("Running pending migrations down without migrations to run", async () => {
      response = await getDeleteResponse();
      expect(response.status).toBe(204);
    });
    test("Running pending migrations down with migrations to run", async () => {
      await getPostResponse();
      response = await getDeleteResponse();
      expect(response.status).toBe(200);
      response = await getGetResponse();
      body = await response.json();
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
