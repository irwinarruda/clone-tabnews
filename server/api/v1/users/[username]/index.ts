import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";
import user from "~/models/user";

const router = createNuxtRouter();

router.get(async (event) => {
  const username = getRouterParam(event, "username");
  const fetchedUser = await user.findByUsername(username);
  return fetchedUser;
});

router.patch(async (event) => {
  const username = getRouterParam(event, "username");
  const body = await readBody(event);
  const updatedUser = await user.update(username, body);
  return updatedUser;
});

export default router.serve(controller.errorHandlers);
