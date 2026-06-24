import { Env, GenerateRequest, GenerateResponse, LLM_ERROR_STATUS } from "../../types";
import { getCorsHeaders } from "../../lib/cors";
import { createLLMProvider } from "../../providers/llm.factory";
import { KVCacheRepository } from "../../repositories/kv-cache.repository";
import { ICacheRepository } from "../../repositories/cache.interface";
import { jsonrepair } from "jsonrepair";
import { RouteHandler } from "../../lib/router";

function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...getCorsHeaders() },
  });
}

function buildCacheKey(topic: string, difficulty: string, includeExamples: boolean): string {
  return `v1:${topic.toLowerCase().trim()}:${difficulty}:examples=${includeExamples}`;
}

async function callLLM(
  env: Env,
  topic: string,
  difficulty: string,
  includeExamples: boolean,
  userApiKey: string | undefined,
  count: number,
  previousQuestions: string[],
  maxExclusionListSize: number
): Promise<{ data: GenerateResponse } | { error: Response }> {
  let raw: string;
  try {
    const provider = createLLMProvider(env);
    const result = await provider.generate(
      topic, difficulty, includeExamples, userApiKey,
      count,
      previousQuestions.length > 0 ? previousQuestions : undefined,
      maxExclusionListSize
    );
    raw = result.raw;
  } catch {
    return { error: jsonResponse({ success: false, message: "LLM service unavailable" }, 502) };
  }

  let parsed: GenerateResponse;
  try {
    parsed = JSON.parse(jsonrepair(raw)) as GenerateResponse;
  } catch {
    console.error("Unparseable LLM response:", raw.substring(0, 300));
    return { error: jsonResponse({ success: false, message: "LLM returned malformed response" }, 502) };
  }

  if (typeof parsed.success !== "boolean") {
    return { error: jsonResponse({ success: false, message: "LLM response missing 'success' field" }, 502) };
  }

  return { data: parsed };
}

export const handleGenerate: RouteHandler = async (request, env) => {
  const reqBody = (await request.json()) as GenerateRequest;
  const { topic, difficulty, includeExamples = true, forceRefresh = false } = reqBody;
  const userApiKey = request.headers.get("X-LLM-API-Key") ?? undefined;

  const maxLimit = parseInt(env.MAX_LIMIT || "50", 10);
  const limit = Math.min(Math.max(reqBody.limit ?? 15, 1), maxLimit);
  const offset = Math.max(reqBody.offset ?? 0, 0);
  const maxQuestionsPerCache = parseInt(env.MAX_QUESTIONS_PER_CACHE || "200", 10);
  const maxExclusionListSize = parseInt(env.MAX_EXCLUSION_LIST_SIZE || "50", 10);

  const repo: ICacheRepository = new KVCacheRepository(env.QA_CACHE);
  const cacheKey = buildCacheKey(topic, difficulty, includeExamples);

  const cached = await repo.get<GenerateResponse>(cacheKey);
  const cachedQuestions: any[] =
    cached && cached.success && Array.isArray(cached.questions) ? cached.questions : [];
  const baseFields = cached && cached.success
    ? { validation_reasoning: cached.validation_reasoning, topic: cached.topic, difficulty: cached.difficulty, definition: cached.definition, recommendations: cached.recommendations }
    : {};

  if (!forceRefresh && cachedQuestions.length >= offset + limit) {
    return jsonResponse(
      { success: true, ...baseFields, questions: cachedQuestions.slice(offset, offset + limit) },
      200
    );
  }

  const previousQuestions: string[] = cachedQuestions.map((q: any) => q.question as string);

  // Ask the LLM to generate exactly as many new questions as we need, with a floor of 10
  // so we always warm the cache a bit beyond the immediate request.
  const needed = (offset + limit) - cachedQuestions.length;
  const count = Math.max(needed, 10);

  const llmResult = await callLLM(env, topic, difficulty, includeExamples, userApiKey, count, previousQuestions, maxExclusionListSize);
  if ("error" in llmResult) return llmResult.error;

  const parsed = llmResult.data;

  if (!parsed.success) {
    const status = LLM_ERROR_STATUS[parsed.errorCode] ?? 422;
    return jsonResponse(parsed, status);
  }

  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    return jsonResponse({ success: false, message: "LLM returned empty questions array" }, 502);
  }

  const combined: any[] = [...cachedQuestions, ...parsed.questions];
  const capped = combined.slice(-maxQuestionsPerCache);
  capped.forEach((q, i) => { q.id = i + 1; });

  const ttl = parseInt(env.CACHE_TTL_SECONDS || "86400", 10);
  await repo.put(cacheKey, JSON.stringify({ ...parsed, questions: capped }), { expirationTtl: ttl });

  return jsonResponse(
    { ...parsed, questions: capped.slice(offset, offset + limit) },
    200
  );
};
