export interface LLMGenerateResult {
  raw: string;
}

export interface LLMProvider {
  generate(
    topic: string,
    difficulty: string,
    includeExamples?: boolean,
    apiKey?: string,
    count?: number,
    previousQuestions?: string[],
    maxExclusionListSize?: number
  ): Promise<LLMGenerateResult>;
}
