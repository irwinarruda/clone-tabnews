import orquestrator from "~/infra/orquestrator";

describe("delete /api/v1/sessions", () => {
  const genericSessionError = {
    status_code: 404,
    name: "NotFoundError",
    action: "Verifique se você está realmente logado e se a sessão existe.",
    message: "Sessão não encontrada.",
  };
  let response: Response;
  let body: any;
  beforeAll(async () => {
    await orquestrator.clearDatabase();
    await orquestrator.runPendingMigrations();
  });
  describe("Anonymous user", () => {
    test("Trying to delete unexisting session should never work", async () => {
      response = await getResponse();
      body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toEqual(genericSessionError);
    });
    test("Deleting a non existing session should not work", async () => {
      await orquestrator.createUser();
      response = await getResponse("invalid-session-id");
      body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toEqual(genericSessionError);
    });
  });
  describe("Existing user", () => {
    test("Deleting a session that already exists should work", async () => {
      const user = await orquestrator.createUser();
      const createdSession = await orquestrator.createSession(user.id);
      response = await getResponse(createdSession.token);
      const cookies = response.headers.getSetCookie();
      expect(response.status).toBe(204);
      const isSessionCookieRemoved = cookies.some(
        (cookie) =>
          cookie.startsWith("session_id=") && cookie.includes("Max-Age=0"),
      );
      expect(isSessionCookieRemoved).toBe(true);
    });
    test("Deleting an old session should not work", async () => {
      const user = await orquestrator.createUser();
      const createdSession = await orquestrator.createSession(user.id);
      await getResponse(createdSession.token);
      response = await getResponse(createdSession.token);
      body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toEqual(genericSessionError);
    });
  });
});

async function getResponse(sessionId?: string) {
  const headers: HeadersInit = {};
  if (sessionId) {
    headers.Cookie = `session_id=${sessionId}`;
  }
  return fetch("http://localhost:3000/api/v1/sessions", {
    method: "DELETE",
    headers,
  });
}
