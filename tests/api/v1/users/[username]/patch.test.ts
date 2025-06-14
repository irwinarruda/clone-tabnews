import orquestrator from "~/infra/orquestrator";
import passwordModel from "~/models/password";

describe("patch /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    beforeAll(async () => {
      await orquestrator.clearDatabase();
      await orquestrator.runPendingMigrations();
    });
    test("with non existing user", async () => {
      response = await getResponse("TestUser", {});
      body = await response.json();
      expect(response.status).toBe(404);
      expect(body.name).toBe("NotFoundError");
      expect(body.message).toBe("O usuário informado não existe.");
      expect(body.action).toBe(
        "Utilize outro nome de usuário para realizar a busca.",
      );
    });
    test("with existing username", async () => {
      await orquestrator.createUser({ username: "TestUser" });
      await orquestrator.createUser({ username: "TestUser2" });
      const username = "TestUser2";
      response = await getResponse("TestUser", { username });
      body = await response.json();
      expect(response.status).toBe(400);
      expect(body.name).toBe("ValidationError");
      expect(body.message).toBe("O usuário informado já está sendo utilizado.");
      expect(body.action).toBe(
        "Utilize outro nome de usuário para realizar esta operação.",
      );
    });
    test("with existing email", async () => {
      const user = await orquestrator.createUser({
        email: "testuser@example.com",
      });
      await orquestrator.createUser({ email: "testuser2@example.com" });
      const email = "testuser2@example.com";
      response = await getResponse(user.username, { email });
      body = await response.json();
      expect(response.status).toBe(400);
      expect(body.name).toBe("ValidationError");
      expect(body.message).toBe("O email informado já está sendo utilizado.");
      expect(body.action).toBe(
        "Utilize outro email para realizar esta operação.",
      );
    });
    test("with the same username", async () => {
      await orquestrator.createUser({ username: "SameUsername" });
      const username = "SameUsername".toUpperCase();
      response = await getResponse(username, { username });
      body = await response.json();
      expect(response.status).toBe(200);
      expect(body).not.toHaveProperty("name");
    });
    test("with unique username", async () => {
      const user = await orquestrator.createUser();
      const username = "UniqueUsername";
      response = await getResponse(user.username, { username });
      body = await response.json();
      expect(response.status).toBe(200);
      expect(body.username).toBe(username);
      expect(body.updated_at > body.created_at).toBe(true);
    });
    test("with unique email", async () => {
      const user = await orquestrator.createUser();
      const email = "uniqueEmail@example.com";
      response = await getResponse(user.username, { email });
      body = await response.json();
      expect(response.status).toBe(200);
      expect(body.email).toBe(email);
      expect(body.updated_at > body.created_at).toBe(true);
    });
    test("with different password", async () => {
      const user = await orquestrator.createUser();
      const password = "passwordDifferent";
      response = await getResponse(user.username, { password });
      body = await response.json();
      expect(response.status).toBe(200);
      expect(body.password).not.toBe(password);
      expect(await passwordModel.compareHash(password, body.password)).toBe(
        true,
      );
      expect(body.updated_at > body.created_at).toBe(true);
    });
  });
});

async function getResponse(username: string, user: any) {
  return fetch(`http://localhost:3000/api/v1/users/${username}`, {
    method: "PATCH",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
