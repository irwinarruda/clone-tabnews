import { version } from "uuid";
import orquestrator from "~/infra/orquestrator";
import userModel from "~/models/user";
import passwordModel from "~/models/password";

describe("post /api/v1/users", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    beforeAll(async () => {
      await orquestrator.clearDatabase();
      await orquestrator.runPendingMigrations();
    });
    test("with unique and valid data", async () => {
      const user = {
        username: "TestUser",
        email: "testuser@example.com",
        password: "password123",
      };
      response = await getResponse(user);
      body = await response.json();
      expect(response.status).toBe(201);
      expect(version(body.id)).toBe(4);
      expect(body.username).toBe(user.username);
      expect(body.email).toBe(user.email);
      expect(body.password).not.toBe(user.password);
      expect(body.password.startsWith("$2")).toBe(true);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      const createdUser = await userModel.findByUsername(user.username);
      let isValidPassword = await passwordModel.compareHash(
        user.password,
        createdUser.password,
      );
      expect(isValidPassword).toBe(true);
      isValidPassword = await passwordModel.compareHash(
        user.password + "wrong",
        createdUser.password,
      );
      expect(isValidPassword).toBe(false);
    });
    test("with duplicate email", async () => {
      response = await getResponse({
        username: "Other TestUser",
        email: "Testuser@examplE.com",
        password: "password123",
      });
      body = await response.json();
      expect(response.status).toBe(400);
      expect(body.name).toBe("ValidationError");
      expect(body.message).toBe("O email informado já está sendo utilizado.");
      expect(body.action).toBe(
        "Utilize outro email para realizar esta operação.",
      );
    });
    test("with duplicate username", async () => {
      response = await getResponse({
        username: "TestUser",
        email: "testuser1@example.com",
        password: "password123",
      });
      body = await response.json();
      expect(response.status).toBe(400);
      expect(body.name).toBe("ValidationError");
      expect(body.message).toBe("O usuário informado já está sendo utilizado.");
      expect(body.action).toBe(
        "Utilize outro nome de usuário para realizar esta operação.",
      );
    });
  });
});

async function getResponse(user: any) {
  return fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
