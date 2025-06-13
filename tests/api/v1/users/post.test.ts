import { version } from "uuid";
import orquestrator from "~/infra/orquestrator";

describe("post /api/v1/users", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    const baseUser = {
      username: "TestUser",
      email: "testuser@example.com",
      password: "password123",
    };
    async function getResponse() {
      return fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        body: JSON.stringify(baseUser),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    beforeAll(async () => {
      await orquestrator.clearDatabase();
      await orquestrator.runPendingMigrations();
    });
    test("With unique and valid data", async () => {
      response = await getResponse();
      body = await response.json();
      expect(response.status).toBe(201);
      const user = {
        username: "TestUser",
        email: "testuser@example.com",
        password: "password123",
      };
      expect(version(body.id)).toBe(4);
      expect(body.username).toBe(user.username);
      expect(body.email).toBe(user.email);
      expect(body.password).toBe(user.password);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
    });
  });
});
