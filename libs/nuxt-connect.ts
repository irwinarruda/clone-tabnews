import {
  defineEventHandler,
  type EventHandler,
  type EventHandlerRequest,
  type EventHandlerResolver,
  type EventHandlerResponse,
  type H3Event,
  type HTTPMethod,
} from "h3";

interface ErrorEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  Response extends EventHandlerResponse = EventHandlerResponse,
> {
  __is_handler__?: true;
  __resolve__?: EventHandlerResolver;
  (event: H3Event<Request>, error: unknown): Response;
}
type NuxtFunc<
  Request = EventHandlerRequest,
  Response = EventHandlerResponse,
> = EventHandler<
  Request extends EventHandlerRequest ? Request : EventHandlerRequest,
  Request extends EventHandlerRequest ? Response : Request
>;

type NuxtErrorFunc<
  Request = EventHandlerRequest,
  Response = EventHandlerResponse,
> = ErrorEventHandler<
  Request extends EventHandlerRequest ? Request : EventHandlerRequest,
  Request extends EventHandlerRequest ? Response : Request
>;

export type NuxtConnectHandlerOptions<
  Request = EventHandlerRequest,
  Response = EventHandlerResponse,
> = {
  onNoMatch?: NuxtFunc<Request, Response>;
  onError?: NuxtErrorFunc<Request, Response>;
};

export class NuxtConnect {
  private allowedMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"] as const;
  get!: typeof defineEventHandler;
  post!: typeof defineEventHandler;
  patch!: typeof defineEventHandler;
  put!: typeof defineEventHandler;
  delete!: typeof defineEventHandler;
  constructor(private map: Map<HTTPMethod, NuxtFunc> = new Map()) {
    for (const method of this.allowedMethods) {
      const key = method.toLowerCase() as Lowercase<
        (typeof this.allowedMethods)[number]
      >;
      this[key] = ((fun: any) => {
        this.storeGenericMethod(method, fun);
        return this;
      }) as unknown as typeof defineEventHandler;
    }
  }
  private storeGenericMethod(method: HTTPMethod, fun: NuxtFunc) {
    this.map.set(method, fun);
  }
  handler(args: NuxtConnectHandlerOptions = {}) {
    return defineEventHandler(async (event) => {
      if (!args.onNoMatch) args.onNoMatch = () => "No Match";
      if (!args.onError)
        args.onError = (_, err) =>
          err instanceof Error ? err.message : "Error";
      try {
        for (const method of this.allowedMethods) {
          if (event.method !== method) continue;
          const fun = this.map.get(method);
          if (fun) return await fun(event);
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
