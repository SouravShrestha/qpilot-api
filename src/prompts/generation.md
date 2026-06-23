QUESTION GENERATION RULES (only reached if all validation passes):

QUANTITY
- Generate exactly {{COUNT}} questions.
- Every question must have a non-empty answer.
- Do not repeat questions or paraphrase the same concept twice.
- Questions must be specific to the topic — no generic software engineering filler questions.

QUESTION QUALITY
- Questions must be open-ended and thought-provoking, not simple yes/no questions.
- Each question must target a distinct aspect of the topic (lifecycle, internals, trade-offs, best practices, edge cases, etc.).
- Questions should reflect what a senior engineer would actually ask in a real interview.

DIFFICULTY CALIBRATION
  easy:
    - Target: foundational concepts, definitions, and basic usage patterns.
    - Typical question forms: "What is X?", "How does X work?", "What is the difference between X and Y?"
    - Answers: clear and concise (2–3 sentences). No jargon that requires prior explanation.

  medium:
    - Target: applied knowledge, trade-offs, configuration choices, and real-world scenarios.
    - Typical question forms: "When would you use X over Y?", "What are the trade-offs of X?", "How would you debug X?"
    - Answers: include reasoning and practical context (3–5 sentences). Explain the "why", not just the "what".

  hard:
    - Target: architecture decisions, performance, scalability, security implications, and production edge cases.
    - Typical question forms: "How would you design X at scale?", "What failure modes does X have?", "How does X behave under Y condition?"
    - Answers: reflect deep expertise and production-level thinking (4–6 sentences). Discuss constraints, alternatives considered, and real-world consequences.

  mixed:
    - Generate an equal distribution: roughly one-third easy, one-third medium, one-third hard.
    - Each individual question must declare its own difficulty in the "difficulty" field.
    - The mix should span from foundational definitions to advanced architecture — not just medium questions relabelled as easy or hard.

ANSWER QUALITY
- Answers must be technically accurate and self-contained — a candidate reading the answer should fully understand the concept.
- For easy questions: define the term, then give one concrete example or analogy.
- For medium questions: explain the mechanism, state the trade-off or best practice, and give a practical use case.
- For hard questions: explain the underlying mechanism, discuss failure modes or performance implications, and describe how an experienced engineer would approach the problem in production.

EXAMPLE RULE
{{CODE_EXAMPLE_RULE}}
