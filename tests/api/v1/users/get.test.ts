import orquestrator from "~/infra/orquestrator";
import session from "~/models/session";

describe("get /api/v1/users", () => {
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
  afterEach(() => {
    vi.useRealTimers();
  });
  describe("Anonymous user", () => {
    test("Trying to fetch an user without session_id should not work", async () => {
      response = await getResponse();
      body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toEqual(genericSessionError);
    });
    test("Trying to fetch an user with wrong session_id should not work", async () => {
      response = await getResponse("wrong-session-id");
      body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toEqual(genericSessionError);
    });
  });
  describe("Existing user", () => {
    test("Trying to fetch an user with old session_id should not work", async () => {
      const expiredNow = new Date();
      expiredNow.setSeconds(
        expiredNow.getSeconds() - session.EXPIRATION_DATE_IN_SECONDS - 1,
      );
      vi.useFakeTimers({ now: expiredNow, toFake: ["Date"] });
      const user = await orquestrator.createUser();
      const createdSession = await orquestrator.createSession(user.id);
      vi.useRealTimers();
      response = await getResponse(createdSession.token);
      body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toEqual(genericSessionError);
    });
    test("Trying to fetch an user with correct session_id should work", async () => {
      const user = await orquestrator.createUser();
      const createdSession = await orquestrator.createSession(user.id);
      response = await getResponse(createdSession.token);
      body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toEqual({
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      });
    });
  });
});

async function getResponse(sessionId?: string) {
  return fetch("http://localhost:3000/api/v1/users", {
    headers: { Cookie: `session_id=${sessionId}` },
  });
}
