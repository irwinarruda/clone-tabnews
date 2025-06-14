import type { NuxtConnectHandlerOptions } from "~/libs/nuxt-connect";
import {
  InternalServerError,
  ServiceError,
  MethodNotAllowedError,
  ValidationError,
} from "./errors";

const errorHandlers: NuxtConnectHandlerOptions = {
  onNoMatch(event) {
    const responseError = new MethodNotAllowedError();
    setResponseStatus(event, responseError.statusCode);
    return responseError.toJSON();
  },
  onError(event, error) {
    if (error instanceof ValidationError) {
      setResponseStatus(event, error.statusCode);
      return error.toJSON();
    }
    console.error(error);
    let statusCode: number | undefined;
    if (error instanceof ServiceError) {
      statusCode = error.statusCode;
    }
    const responseError = new InternalServerError(error as Error, statusCode);
    setResponseStatus(event, responseError.statusCode);
    return responseError.toJSON();
  },
};

export default { errorHandlers };
