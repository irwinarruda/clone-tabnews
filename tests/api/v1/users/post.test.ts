import { version } from "uuid";
import orquestrator from "~/infra/orquestrator";

describe("post /api/v1/users", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    beforeAll(async () => {
      await orquestrator.clearDatabase();
      await orquestrator.runPendingMigrations();
    });
    test("with unique and valid data", async () => {
      const user = getBaseUser();
      response = await getResponse(user);
      body = await response.json();
      expect(response.status).toBe(201);
      expect(version(body.id)).toBe(4);
      expect(body.username).toBe(user.username);
      expect(body.email).toBe(user.email);
      expect(body.password).toBe(user.password);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
    });
    test("with duplicate email", async () => {
      const user = getBaseUser();
      user.username = "Other TestUser";
      user.email = "Testuser@examplE.com";
      response = await getResponse(user);
      body = await response.json();
      expect(response.status).toBe(400);
      expect(body.message).toBe("O email informado já está sendo utilizado.");
      expect(body.action).toBe("Utilize outro email para realizar o cadastro.");
    });
    test("with duplicate username", async () => {
      const user = getBaseUser();
      user.email = "testuser1@example.com";
      response = await getResponse(user);
      body = await response.json();
      expect(response.status).toBe(400);
      expect(body.message).toBe("O usuário informado já está sendo utilizado.");
      expect(body.action).toBe(
        "Utilize outro nome de usuário para realizar o cadastro.",
      );
    });
  });
});

function getBaseUser() {
  return {
    username: "TestUser",
    email: "testuser@example.com",
    password: "password123",
  };
}

async function getResponse(user: any) {
  return fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
