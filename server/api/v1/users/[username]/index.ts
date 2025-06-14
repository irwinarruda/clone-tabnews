import { createNuxtRouter } from "~/libs/nuxt-connect";
import controller from "~/infra/controller";
import user from "~/models/user";

const router = createNuxtRouter();

router.get(async (event) => {
  const username = getRouterParam(event, "username");
  const fetchedUser = await user.findByUsername(username);
  return fetchedUser;
});

export default router.serve(controller.errorHandlers);
