import { LLMProvider } from "./llm.interface";
import { GroqProvider } from "./groq.provider";
import { Env } from "../types";

export function createLLMProvider(env: Env): LLMProvider {
  switch (env.LLM_PROVIDER) {
    case "groq":
      return new GroqProvider(env);
    // case "openai":
    //   return new OpenAIProvider(env);
    default:
      throw new Error(`Unknown LLM_PROVIDER: "${env.LLM_PROVIDER}"`);
  }
}
