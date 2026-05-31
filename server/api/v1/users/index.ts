import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";
import user from "~/models/user";
import session from "~/models/session";

const router = createNuxtRouter();

router.get(async (event) => {
  const sessionId = getCookie(event, "session_id");
  const publicSession = await session.findValidByToken(sessionId);
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
