import type { H3Event } from "h3";
import type { NuxtConnectHandlerOptions } from "~/libs/nuxt-connect";
import { serverEnv } from "~/config/server-env";
import session from "~/models/session";
import {
  InternalServerError,
  ServiceError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "./errors";

function setSessionIdCookie(event: H3Event, sessionToken: string) {
  setCookie(event, "session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_DATE_IN_SECONDS,
    httpOnly: true,
    secure: serverEnv.Mode === "production",
  });
}

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
    if (error instanceof NotFoundError) {
      setResponseStatus(event, error.statusCode);
      return error.toJSON();
    }
    if (error instanceof UnauthorizedError) {
      deleteCookie(event, "session_id");
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

export default { errorHandlers, setSessionIdCookie };
