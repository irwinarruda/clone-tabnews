import orquestrator from "~/infra/orquestrator";
import session from "~/models/session";

describe("get /api/v1/users", () => {
  const nonCacheableHeader = "no-store, no-cache, max-age=0, must-revalidate";
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
  afterEach(() => {
    vi.useRealTimers();
  });
  describe("Anonymous user", () => {
    test("Trying to fetch an user without session_id should not work", async () => {
      response = await getResponse();
      body = await response.json();
      expect(response.status).toBe(401);
      expect(response.headers.get("Cache-Control")).toBe(nonCacheableHeader);
      expect(body).toEqual(unauthorizedSessionError);
      expectSessionCookieToBeRemoved(response);
    });
    test("Trying to fetch an user with wrong session_id should not work", async () => {
      response = await getResponse("wrong-session-id");
      body = await response.json();
      expect(response.status).toBe(401);
      expect(response.headers.get("Cache-Control")).toBe(nonCacheableHeader);
      expect(body).toEqual(unauthorizedSessionError);
      expectSessionCookieToBeRemoved(response);
    });
  });
  describe("Existing user", () => {
    test("Trying to fetch an user with old session_id should not work", async () => {
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
    test("Trying to fetch an user with correct session_id should work", async () => {
      const user = await orquestrator.createUser();
      const createdSession = await orquestrator.createSession(user.id);
      response = await getResponse(createdSession.token);
      body = await response.json();
      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe(nonCacheableHeader);
      expect(body).toEqual({
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      });
    });
    test("Trying to fetch an user with correct session_id should renew expires_at", async () => {
      const almostExpired = new Date();
      almostExpired.setDate(almostExpired.getDate() - 29);
      vi.useFakeTimers({ now: almostExpired });
      const user = await orquestrator.createUser();
      const createdSession = await orquestrator.createSession(user.id);
      vi.useRealTimers();
      response = await getResponse(createdSession.token);
      body = await response.json();
      const cookies = response.headers.getSetCookie();
      expect(response.status).toBe(200);
      expect(body.id).toBe(user.id);
      const isRenewedCookie = cookies.some(
        (cookie) =>
          cookie.includes(`session_id=${createdSession.token}`) &&
          cookie.includes(`Max-Age=${session.EXPIRATION_DATE_IN_SECONDS}`) &&
          cookie.includes("HttpOnly"),
      );
      expect(isRenewedCookie).toBe(true);
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
  return fetch("http://localhost:3000/api/v1/users", {
    headers: { Cookie: `session_id=${sessionId}` },
  });
}
