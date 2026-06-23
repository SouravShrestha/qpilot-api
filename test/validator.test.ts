import { expect, test, describe } from "vitest";
import { createValidator } from "../src/middleware/validator";

function makeEnv(overrides: Record<string, string> = {}) {
  return { MAX_LIMIT: "50", ...overrides } as any;
}

function postJson(body: unknown) {
  return new Request("http://localhost/v1/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const schema = {
  topic: { required: true, type: "string" as const },
  difficulty: {
    required: true,
    type: "string" as const,
    custom: (val: string) =>
      ["easy", "medium", "hard", "mixed"].includes(val) ? null : "Invalid difficulty",
  },
};

describe("createValidator", () => {
  test("passes when required fields are present and valid", async () => {
    const validator = createValidator(schema);
    const res = await validator(postJson({ topic: "Docker", difficulty: "easy" }), makeEnv(), {} as any);
    expect(res).toBeUndefined();
  });

  test("returns 400 when required field is missing", async () => {
    const validator = createValidator(schema);
    const res = await validator(postJson({ difficulty: "easy" }), makeEnv(), {} as any);
    expect(res?.status).toBe(400);
    const data: any = await res?.json();
    expect(data.message).toContain("topic");
  });

  test("returns 400 when type is wrong", async () => {
    const validator = createValidator(schema);
    const res = await validator(postJson({ topic: 123, difficulty: "easy" }), makeEnv(), {} as any);
    expect(res?.status).toBe(400);
  });

  test("returns 400 when custom validator fails", async () => {
    const validator = createValidator(schema);
    const res = await validator(postJson({ topic: "Docker", difficulty: "extreme" }), makeEnv(), {} as any);
    expect(res?.status).toBe(400);
    const data: any = await res?.json();
    expect(data.message).toBe("Invalid difficulty");
  });

  test("returns 400 on invalid JSON body", async () => {
    const validator = createValidator(schema);
    const req = new Request("http://localhost/v1/generate", {
      method: "POST",
      body: "not json",
    });
    const res = await validator(req, makeEnv(), {} as any);
    expect(res?.status).toBe(400);
    const data: any = await res?.json();
    expect(data.message).toBe("Invalid JSON body");
  });
});
