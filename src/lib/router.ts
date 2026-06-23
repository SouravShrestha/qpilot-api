import { Env } from "../types";
import { ExecutionContext } from "@cloudflare/workers-types";

export type Middleware = (
  request: Request,
  env: Env,
  ctx: ExecutionContext
) => Response | void | undefined | Promise<Response | void | undefined>;

export type RouteHandler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext
) => Response | Promise<Response>;

type Route = {
  method: string;
  path: string | RegExp;
  handler: RouteHandler;
  middlewares: Middleware[];
};

export class Router {
  private routes: Route[] = [];
  private globalMiddlewares: Middleware[] = [];

  public use(middleware: Middleware): void {
    this.globalMiddlewares.push(middleware);
  }

  public get(path: string | RegExp, ...handlers: (Middleware | RouteHandler)[]): void {
    this.addRoute("GET", path, handlers);
  }

  public post(path: string | RegExp, ...handlers: (Middleware | RouteHandler)[]): void {
    this.addRoute("POST", path, handlers);
  }

  public all(path: string | RegExp, ...handlers: (Middleware | RouteHandler)[]): void {
    this.addRoute("ALL", path, handlers);
  }

  private addRoute(method: string, path: string | RegExp, handlers: (Middleware | RouteHandler)[]): void {
    const handler = handlers[handlers.length - 1] as RouteHandler;
    const middlewares = handlers.slice(0, -1) as Middleware[];
    this.routes.push({ method, path, handler, middlewares });
  }

  private matchPath(routePath: string | RegExp, requestPath: string): boolean {
    if (typeof routePath === "string") {
      return routePath === requestPath;
    }
    return routePath.test(requestPath);
  }

  public async handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method;

    for (const middleware of this.globalMiddlewares) {
      const response = await middleware(request, env, ctx);
      if (response instanceof Response) return response;
    }

    const route = this.routes.find(
      (r) => (r.method === method || r.method === "ALL") && this.matchPath(r.path, pathname)
    );

    if (route) {
      for (const middleware of route.middlewares) {
        const response = await middleware(request, env, ctx);
        if (response instanceof Response) return response;
      }
      return await route.handler(request, env, ctx);
    }

    return new Response(JSON.stringify({ success: false, message: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}
