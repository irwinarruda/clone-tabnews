import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";
import session from "~/models/session";
import authentication from "~/models/authentication";
import { serverEnv } from "~/config/server-env";

const router = createNuxtRouter();

router.post(async (event) => {
  const body = await readBody(event);
  const user = await authentication.getAuthenticatedUser(body);
  const createdSession = await session.create(user.id);
  setCookie(event, "session_id", createdSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_DATE_IN_SECONDS,
    httpOnly: true,
    secure: serverEnv.Mode === "production",
  });
  setResponseStatus(event, 201);
  return createdSession;
});

export default router.serve(controller.errorHandlers);
