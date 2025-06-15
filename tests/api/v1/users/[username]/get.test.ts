import { version } from "uuid";
import orquestrator from "~/infra/orquestrator";

describe("get /api/v1/users/[username]", () => {
  let response: Response;
  let body: any;
  beforeAll(async () => {
    await orquestrator.clearDatabase();
    await orquestrator.runPendingMigrations();
  });
  describe("Anonymous user", () => {
    test("with exact case match", async () => {
      const user = getBaseUser();
      await createUserResponse(user);
      response = await getResponse(user.username);
      body = await response.json();
      expect(response.status).toBe(200);
      // expect(body.password).not.toBeDefined();
      expect(body.username).toBe(user.username);
      expect(body.email).toBe(user.email);
      expect(version(body.id)).toBe(4);
    });
    test("with wrong case match", async () => {
      const user = getBaseUser();
      user.username = "TESTUSER";
      response = await getResponse(user.username);
      body = await response.json();
      expect(response.status).toBe(200);
      // expect(body.password).not.toBeDefined();
      expect(body.username).not.toBe(user.username);
      expect(body.email).toBe(user.email);
    });
    test("with non existing user", async () => {
      response = await getResponse("none_existing_user");
      body = await response.json();
      expect(response.status).toBe(404);
      expect(body.name).toBe("NotFoundError");
      expect(body.message).toBe("O usuário informado não existe.");
      expect(body.action).toBe(
        "Utilize outro nome de usuário para realizar a busca.",
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

async function getResponse(username: string) {
  return fetch(`http://localhost:3000/api/v1/users/${username}`);
}

async function createUserResponse(user: any) {
  return fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
