import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";
import user from "~/models/user";

const router = createNuxtRouter();

router.post(async (event) => {
  const body = await readBody(event);
  const newUser = await user.create(body);
  setResponseStatus(event, 201);
  return newUser;
});

export default router.serve(controller.errorHandlers);
