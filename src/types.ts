import { KVNamespace } from "@cloudflare/workers-types";

export interface Env {
  QA_CACHE: KVNamespace;
  APP_API_KEY: string;
  GROQ_API_KEY: string;
  LLM_PROVIDER: string;
  GROQ_MODEL: string;
  GROQ_API_URL: string;
  CACHE_TTL_SECONDS: string;
  RATE_LIMIT_MAX: string;
  RATE_LIMIT_WINDOW_SECONDS: string;
  MAX_QUESTIONS_PER_CACHE: string;
  MAX_EXCLUSION_LIST_SIZE: string;
  MAX_LIMIT: string;
}

export interface GenerateRequest {
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  includeExamples?: boolean;
  forceRefresh?: boolean;
  limit?: number;
  offset?: number;
}

export interface Question {
  id: number;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  example?: {
    type: "code" | "text";
    content: string;
  } | null;
}

export interface SuccessResponse {
  success: true;
  validation_reasoning: string;
  topic: string;
  difficulty: string;
  questions: Question[];
}

export interface ErrorResponse {
  success: false;
  validation_reasoning: string;
  errorCode: "INVALID_DIFFICULTY" | "UNSUPPORTED_TOPIC" | "TOPIC_TOO_BROAD";
  message: string;
  suggestions: string[];
}

export type GenerateResponse = SuccessResponse | ErrorResponse;

export const LLM_ERROR_STATUS: Record<ErrorResponse["errorCode"], number> = {
  INVALID_DIFFICULTY: 400,
  UNSUPPORTED_TOPIC: 422,
  TOPIC_TOO_BROAD: 422,
};
