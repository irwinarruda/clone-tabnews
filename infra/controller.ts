import type { NuxtConnectHandlerOptions } from "~/libs/nuxt-connect";

const errorHandlers: NuxtConnectHandlerOptions = {
  onNoMatch() {
    return { error: "Method not allowed" };
  },
  onError() {
    return { error: "erro aqui" };
  },
};

export default { errorHandlers };
