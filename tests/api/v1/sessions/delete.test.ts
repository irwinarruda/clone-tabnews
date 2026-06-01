import orquestrator from "~/infra/orquestrator";
import session from "~/models/session";

describe("delete /api/v1/sessions", () => {
  const unauthorizedSessionError = {
    status_code: 401,
    name: "UnauthorizedError",
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
      expect(response.status).toBe(401);
      expect(body).toEqual(unauthorizedSessionError);
      expectSessionCookieToBeRemoved(response);
    });
    test("Deleting a non existing session should not work", async () => {
      await orquestrator.createUser();
      response = await getResponse("invalid-session-id");
      body = await response.json();
      expect(response.status).toBe(401);
      expect(body).toEqual(unauthorizedSessionError);
      expectSessionCookieToBeRemoved(response);
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
      expect(response.status).toBe(401);
      expect(body).toEqual(unauthorizedSessionError);
      expectSessionCookieToBeRemoved(response);
    });
    test("Deleting an expired session should not work", async () => {
      const expiredNow = new Date();
      expiredNow.setSeconds(
        expiredNow.getSeconds() - session.EXPIRATION_DATE_IN_SECONDS - 1,
      );
      vi.useFakeTimers({ now: expiredNow });
      const user = await orquestrator.createUser();
      const createdSession = await orquestrator.createSession(user.id);
      vi.useRealTimers();

      response = await getResponse(createdSession.token);
      body = await response.json();
      expect(response.status).toBe(401);
      expect(body).toEqual(unauthorizedSessionError);
      expectSessionCookieToBeRemoved(response);
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
