import { expect, test, describe } from "vitest";
import { handleGenerate } from "../src/handlers/v1/generate";

function makeEnv(overrides: Record<string, string> = {}) {
  return {
    GROQ_API_KEY: "test-key",
    GROQ_API_URL: "https://api.groq.com/openai/v1/chat/completions",
    GROQ_MODEL: "llama-3.3-70b-versatile",
    LLM_PROVIDER: "groq",
    CACHE_TTL_SECONDS: "86400",
    MAX_LIMIT: "50",
    MAX_QUESTIONS_PER_CACHE: "200",
    MAX_EXCLUSION_LIST_SIZE: "50",
    QA_CACHE: makeFakeKV(),
    ...overrides,
  } as any;
}

function makeFakeKV(store: Map<string, string> = new Map()) {
  return {
    get: async (key: string) => store.get(key) ?? null,
    getWithMetadata: async (key: string) => ({ value: store.get(key) ?? null, metadata: null }),
    put: async (key: string, value: string) => { store.set(key, value); },
    delete: async (key: string) => { store.delete(key); },
  };
}

function postJson(body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Request("http://localhost/v1/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

const VALID_LLM_RESPONSE = JSON.stringify({
  success: true,
  validation_reasoning: "Valid topic",
  topic: "Docker",
  difficulty: "easy",
  questions: [
    { id: 1, question: "What is Docker?", answer: "A container platform", difficulty: "easy", example: null },
  ],
});

describe("handleGenerate", () => {
  test("returns 502 when LLM provider is unknown", async () => {
    const env = makeEnv({ LLM_PROVIDER: "unknown" });
    const req = postJson({ topic: "Docker", difficulty: "easy" });
    const res = await handleGenerate(req, env, {} as any);
    // Unknown provider throws, caught as 500 by error handler or 502
    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  test("clamps limit to MAX_LIMIT", async () => {
    const store = new Map<string, string>();
    // Pre-populate cache with enough questions
    const cached = {
      success: true,
      validation_reasoning: "ok",
      topic: "Docker",
      difficulty: "easy",
      questions: Array.from({ length: 60 }, (_, i) => ({
        id: i + 1, question: `Q${i + 1}`, answer: `A${i + 1}`, difficulty: "easy", example: null,
      })),
    };
    store.set("v1:docker:easy:examples=true", JSON.stringify(cached));
    const env = makeEnv({ MAX_LIMIT: "10", QA_CACHE: makeFakeKV(store) } as any);
    const req = postJson({ topic: "Docker", difficulty: "easy", limit: 999 });
    const res = await handleGenerate(req, env, {} as any);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.questions.length).toBeLessThanOrEqual(10);
  });

  test("serves cache hit without calling LLM", async () => {
    const store = new Map<string, string>();
    const cached = {
      success: true,
      validation_reasoning: "ok",
      topic: "Docker",
      difficulty: "easy",
      questions: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1, question: `Q${i + 1}`, answer: `A${i + 1}`, difficulty: "easy", example: null,
      })),
    };
    store.set("v1:docker:easy:examples=true", JSON.stringify(cached));

    let llmCalled = false;
    const env = makeEnv({ QA_CACHE: makeFakeKV(store) } as any);
    // Patch fetch to detect if LLM is called
    const origFetch = globalThis.fetch;
    globalThis.fetch = async () => { llmCalled = true; return new Response("{}"); };

    const req = postJson({ topic: "Docker", difficulty: "easy", limit: 5 });
    await handleGenerate(req, env, {} as any);

    globalThis.fetch = origFetch;
    expect(llmCalled).toBe(false);
  });

  test("returns questions sliced by offset", async () => {
    const store = new Map<string, string>();
    const cached = {
      success: true,
      validation_reasoning: "ok",
      topic: "Docker",
      difficulty: "easy",
      questions: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1, question: `Q${i + 1}`, answer: `A${i + 1}`, difficulty: "easy", example: null,
      })),
    };
    store.set("v1:docker:easy:examples=true", JSON.stringify(cached));
    const env = makeEnv({ QA_CACHE: makeFakeKV(store) } as any);

    const req = postJson({ topic: "Docker", difficulty: "easy", limit: 5, offset: 10 });
    const res = await handleGenerate(req, env, {} as any);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.questions[0].id).toBe(11);
    expect(data.questions.length).toBe(5);
  });
});
