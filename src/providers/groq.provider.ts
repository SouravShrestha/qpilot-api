import { LLMProvider, LLMGenerateResult } from "./llm.interface";
import { Env } from "../types";
import { buildSystemPrompt } from "../lib/prompt-builder";

export class GroqProvider implements LLMProvider {
  constructor(private env: Env) {}

  async generate(
    topic: string,
    difficulty: string,
    includeExamples = true,
    apiKey?: string,
    count = 15,
    previousQuestions?: string[],
    maxExclusionListSize = 50
  ): Promise<LLMGenerateResult> {
    const systemPrompt = buildSystemPrompt(
      topic, difficulty, includeExamples, count, previousQuestions, maxExclusionListSize
    );

    const response = await fetch(this.env.GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey || this.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.env.GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Topic: ${topic}\nDifficulty: ${difficulty}` },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    const raw: string = data.choices[0]?.message?.content ?? "";
    return { raw };
  }
}
