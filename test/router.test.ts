import { expect, test, describe } from "vitest";
import { Router } from "../src/lib/router";

describe("Router", () => {
  test("routes GET requests", async () => {
    const router = new Router();
    router.get("/test", () => new Response("get ok"));
    const res = await router.handle(new Request("http://localhost/test"), {} as any, {} as any);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("get ok");
  });

  test("routes POST requests", async () => {
    const router = new Router();
    router.post("/test", () => new Response("post ok"));
    const res = await router.handle(new Request("http://localhost/test", { method: "POST" }), {} as any, {} as any);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("post ok");
  });

  test("global middleware can short-circuit", async () => {
    const router = new Router();
    router.use(() => new Response("blocked"));
    router.get("/test", () => new Response("get ok"));
    const res = await router.handle(new Request("http://localhost/test"), {} as any, {} as any);
    expect(await res.text()).toBe("blocked");
  });

  test("global middleware passes through when returning void", async () => {
    const router = new Router();
    router.use(() => undefined);
    router.get("/test", () => new Response("passed"));
    const res = await router.handle(new Request("http://localhost/test"), {} as any, {} as any);
    expect(await res.text()).toBe("passed");
  });

  test("route-specific middleware runs before handler", async () => {
    const router = new Router();
    router.get("/test",
      () => new Response("route middleware"),
      () => new Response("get ok")
    );
    const res = await router.handle(new Request("http://localhost/test"), {} as any, {} as any);
    expect(await res.text()).toBe("route middleware");
  });

  test("returns 404 when no route matches", async () => {
    const router = new Router();
    const res = await router.handle(new Request("http://localhost/nope"), {} as any, {} as any);
    expect(res.status).toBe(404);
  });

  test("matches regex paths", async () => {
    const router = new Router();
    router.get(/^\/v\d+\/.*/, () => new Response("versioned"));
    const res = await router.handle(new Request("http://localhost/v1/health"), {} as any, {} as any);
    expect(await res.text()).toBe("versioned");
  });
});
