import persona from "../prompts/persona.md";
import validation from "../prompts/validation.md";
import generation from "../prompts/generation.md";
import schema from "../prompts/schema.md";
import outputRules from "../prompts/output-rules.md";
import exclusions from "../prompts/exclusions.md";

const EXAMPLE_RULE_ON =
  "- You MUST provide an example for EVERY question in the 'example' field. This field must be an object with 'type' (either 'code' or 'text') and 'content'.\n  - Use type 'code' ONLY for actual programming language code. The 'content' MUST be a standard JSON double-quoted string containing markdown backticks (e.g., \"```js\\nconst x = 1;\\n```\"). NEVER use backticks (`) as the actual JSON string delimiter.\n  - Use type 'text' for analogies, real-world scenarios, concepts, or lists where actual programming code doesn't apply. Do NOT use markdown backticks for text.";

const EXAMPLE_RULE_OFF =
  "- Do NOT include any examples. Provide conceptual explanations only, and omit the 'example' field entirely.";

export function buildSystemPrompt(
  topic: string,
  difficulty: string,
  includeExamples: boolean,
  count: number,
  previousQuestions?: string[],
  maxExclusionListSize = 50
): string {
  const exampleRule = includeExamples ? EXAMPLE_RULE_ON : EXAMPLE_RULE_OFF;

  const generationSection = generation
    .replace("{{CODE_EXAMPLE_RULE}}", exampleRule)
    .replace(/\{\{COUNT\}\}/g, String(count));

  const schemaSection = schema
    .replace("{{topic}}", topic)
    .replace("{{difficulty}}", difficulty);

  const sections = [persona, validation, generationSection, schemaSection, outputRules];

  if (previousQuestions && previousQuestions.length > 0) {
    const capped = previousQuestions.slice(-maxExclusionListSize);
    const numbered = capped.map((q, i) => `${i + 1}. ${q}`).join("\n");
    sections.push(
      exclusions
        .replace("{{PREVIOUS_QUESTIONS}}", numbered)
        .replace(/\{\{COUNT\}\}/g, String(count))
    );
  }

  return sections.join("\n---\n\n");
}
