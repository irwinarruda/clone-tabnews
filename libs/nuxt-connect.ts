import {
  defineEventHandler,
  type EventHandler,
  type EventHandlerRequest,
  type EventHandlerResolver,
  type EventHandlerResponse,
  type H3Event,
  type HTTPMethod,
} from "h3";
import type { Hooks } from "crossws";

interface ErrorEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  Response extends EventHandlerResponse = EventHandlerResponse,
> {
  __is_handler__?: true;
  __resolve__?: EventHandlerResolver;
  __websocket__?: Partial<Hooks>;
  (event: H3Event<Request>, error: unknown): Response;
}
type NuxtErrorHandler<
  Request = EventHandlerRequest,
  Response = EventHandlerResponse,
> = ErrorEventHandler<
  Request extends EventHandlerRequest ? Request : EventHandlerRequest,
  Request extends EventHandlerRequest ? Response : Request
>;

type NuxtHandler<
  Request = EventHandlerRequest,
  Response = EventHandlerResponse,
> = EventHandler<
  Request extends EventHandlerRequest ? Request : EventHandlerRequest,
  Request extends EventHandlerRequest ? Response : Request
>;

type NuxtDefineEventHandler = typeof defineEventHandler;

export type NuxtConnectHandlerOptions<
  Request = EventHandlerRequest,
  Response = EventHandlerResponse,
> = {
  onNoMatch?: NuxtHandler<Request, Response>;
  onError?: NuxtErrorHandler<Request, Response>;
};

export class NuxtConnect {
  private endpoints: Map<HTTPMethod, NuxtHandler> = new Map();
  private middlewares: Set<NuxtHandler> = new Set();
  private allowedMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"] as const;
  constructor() {
    type AllowedMethods = (typeof this.allowedMethods)[number];
    for (const method of this.allowedMethods) {
      const key = method.toLowerCase() as Lowercase<AllowedMethods>;
      this[key] = ((handler: any) => {
        this.storeGenericMethod(method, handler);
        return this;
      }) as unknown as NuxtDefineEventHandler;
    }
  }
  private storeGenericMethod(method: HTTPMethod, handler: NuxtHandler) {
    const cloneMiddleware = Array.from(this.middlewares);
    this.middlewares = new Set();
    this.endpoints.set(method, async (event) => {
      for (const middleware of cloneMiddleware) {
        await middleware(event);
      }
      return handler(event);
    });
  }
  get!: NuxtDefineEventHandler;
  post!: NuxtDefineEventHandler;
  patch!: NuxtDefineEventHandler;
  put!: NuxtDefineEventHandler;
  delete!: NuxtDefineEventHandler;
  use<Request, Response>(handler: NuxtHandler<Request, Response>) {
    this.middlewares.add(handler);
    return this;
  }
  serve(args: NuxtConnectHandlerOptions = {}) {
    return defineEventHandler(async (event) => {
      if (!args.onNoMatch) args.onNoMatch = () => "No Match";
      if (!args.onError)
        args.onError = (_, err) =>
          err instanceof Error ? err.message : "Error";
      try {
        for (const method of this.allowedMethods) {
          if (event.method !== method) continue;
          const handler = this.endpoints.get(method);
          if (handler) return await handler(event);
        }
        return await args.onNoMatch(event);
      } catch (err) {
        return await args.onError(event, err);
      }
    });
  }
}

export function createNuxtRouter() {
  return new NuxtConnect();
}
