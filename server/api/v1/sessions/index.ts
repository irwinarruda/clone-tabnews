import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";
import session from "~/models/session";
import authentication from "~/models/authentication";

const router = createNuxtRouter();

router.post(async (event) => {
  const body = await readBody(event);
  const user = await authentication.getAuthenticatedUser(body);
  const createdSession = await session.create(user.id);
  controller.setSessionIdCookie(event, createdSession.token);
  setResponseStatus(event, 201);
  return createdSession;
});

router.delete(async (event) => {
  const sessionId = getCookie(event, "session_id");
  await session.remove(sessionId);
  controller.clearSessionIdCookie(event);
  setResponseStatus(event, 204);
});

export default router.serve(controller.errorHandlers);
