import orquestrator from "~/infra/orquestrator";
import session from "~/models/session";

describe("post /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    let response: Response;
    let body: any;
    beforeAll(async () => {
      await orquestrator.clearDatabase();
      await orquestrator.runPendingMigrations();
    });
    test("with non existing email", async () => {
      response = await getResponse({
        email: "non@non.com",
        password: "validPassword",
      });
      body = await response.json();
      expect(response.status).toBe(401);
      expect(body.name).toBe("UnauthorizedError");
      expect(body.message).toBe("Os dados de autenticação não conferem.");
      expect(body.action).toBe("Por favor revise os dados e tente novamente.");
      expectSessionCookieToBeRemoved(response);
    });
    test("with wrong password", async () => {
      const user = await orquestrator.createUser();
      response = await getResponse({
        email: user.email,
        password: "wrongPassword",
      });
      body = await response.json();
      expect(response.status).toBe(401);
      expect(body.name).toBe("UnauthorizedError");
      expect(body.message).toBe("Os dados de autenticação não conferem.");
      expect(body.action).toBe("Por favor revise os dados e tente novamente.");
      expectSessionCookieToBeRemoved(response);
    });
    test("with correct password", async () => {
      const user = await orquestrator.createUser({ password: "somePassword" });
      response = await getResponse({
        email: user.email,
        password: "somePassword",
      });
      body = await response.json();
      const cookies = response.headers.getSetCookie();
      expect(response.status).toBe(201);
      expect(body.user_id).toBe(user.id);
      expect(Date.parse(body.expires_at)).not.toBeNaN();
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      const isValidCookie = cookies.some(
        (c) =>
          c.includes(`session_id=${body.token}`) &&
          c.includes(`Max-Age=${session.EXPIRATION_DATE_IN_SECONDS}`) &&
          c.includes("HttpOnly"),
      );
      expect(isValidCookie).toBe(true);
      const expiresAt = new Date(body.expires_at);
      const createdAt = new Date(body.created_at);
      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);
      expect(session.addExpirationDate(createdAt)).toStrictEqual(expiresAt);
    });
    test("with correct password should allow multiple active sessions for the same user", async () => {
      const user = await orquestrator.createUser({ password: "somePassword" });
      const firstLoginResponse = await getResponse({
        email: user.email,
        password: "somePassword",
      });
      const firstLoginBody = await firstLoginResponse.json();
      const secondLoginResponse = await getResponse({
        email: user.email,
        password: "somePassword",
      });
      const secondLoginBody = await secondLoginResponse.json();
      expect(firstLoginResponse.status).toBe(201);
      expect(secondLoginResponse.status).toBe(201);
      expect(firstLoginBody.user_id).toBe(user.id);
      expect(secondLoginBody.user_id).toBe(user.id);
      expect(firstLoginBody.token).not.toBe(secondLoginBody.token);
      const firstSessionUserResponse = await getAuthenticatedUserResponse(
        firstLoginBody.token,
      );
      const firstSessionUserBody = await firstSessionUserResponse.json();
      const secondSessionUserResponse = await getAuthenticatedUserResponse(
        secondLoginBody.token,
      );
      const secondSessionUserBody = await secondSessionUserResponse.json();
      expect(firstSessionUserResponse.status).toBe(200);
      expect(secondSessionUserResponse.status).toBe(200);
      expect(firstSessionUserBody.id).toBe(user.id);
      expect(secondSessionUserBody.id).toBe(user.id);
    });
  });
});

function expectSessionCookieToBeRemoved(response: Response) {
  const cookies = response.headers.getSetCookie();
  const isSessionCookieRemoved = cookies.some(
    (cookie) =>
      cookie.startsWith("session_id=") && cookie.includes("Max-Age=0"),
  );
  expect(isSessionCookieRemoved).toBe(true);
}

async function getResponse(user: any) {
  return fetch("http://localhost:3000/api/v1/sessions", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function getAuthenticatedUserResponse(sessionId: string) {
  return fetch("http://localhost:3000/api/v1/users", {
    headers: { Cookie: `session_id=${sessionId}` },
  });
}
