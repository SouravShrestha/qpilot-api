import { expect, test, describe } from "vitest";
import { authenticate } from "../src/middleware/auth";

function makeEnv(key: string) {
  return { APP_API_KEY: key } as any;
}

describe("authenticate middleware", () => {
  test("returns 401 when X-API-Key header is missing", async () => {
    const req = new Request("http://localhost/v1/generate", { method: "POST" });
    const res = await authenticate(req, makeEnv("secret"), {} as any);
    expect(res?.status).toBe(401);
    const data: any = await res?.json();
    expect(data.success).toBe(false);
  });

  test("returns 401 when key is wrong", async () => {
    const req = new Request("http://localhost/v1/generate", {
      method: "POST",
      headers: { "X-API-Key": "wrong" },
    });
    const res = await authenticate(req, makeEnv("secret"), {} as any);
    expect(res?.status).toBe(401);
  });

  test("returns undefined (passes) when key is correct", async () => {
    const req = new Request("http://localhost/v1/generate", {
      method: "POST",
      headers: { "X-API-Key": "secret" },
    });
    const res = await authenticate(req, makeEnv("secret"), {} as any);
    expect(res).toBeUndefined();
  });
});
