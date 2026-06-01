import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";
import user from "~/models/user";
import session from "~/models/session";

const router = createNuxtRouter();

router.get(async (event) => {
  setResponseHeader(
    event,
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  const sessionId = getCookie(event, "session_id");
  const publicSession = await session.findValidByToken(sessionId);
  await session.renew(publicSession.id);
  controller.setSessionIdCookie(event, publicSession.token);
  const userData = await user.findById(publicSession.user_id);
  return userData;
});

router.post(async (event) => {
  const body = await readBody(event);
  const newUser = await user.create(body);
  setResponseStatus(event, 201);
  return newUser;
});

export default router.serve(controller.errorHandlers);
