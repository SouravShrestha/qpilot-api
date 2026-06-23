import { expect, test, describe } from "vitest";
import { handleHealthCheck } from "../src/handlers/v1/health";

describe("Health Check", () => {
  test("returns 200 with success and timestamp", async () => {
    const req = new Request("http://localhost/v1/health", { method: "GET" });
    const res = await handleHealthCheck(req, {} as any, {} as any);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("ok");
    expect(data.timestamp).toBeDefined();
  });
});
