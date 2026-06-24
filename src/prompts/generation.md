QUESTION GENERATION RULES (only reached if all validation passes):

QUANTITY
- Generate exactly {{COUNT}} questions.
- Every question must have a non-empty answer.
- Do not repeat questions or paraphrase the same concept twice.
- Questions must be specific to the topic — no generic filler questions that could apply to any topic.

QUESTION QUALITY
- Questions must be open-ended and thought-provoking, not simple yes/no questions.
- Each question must target a distinct aspect of the topic (definitions, mechanisms, causes, consequences, comparisons, applications, edge cases, debates, best practices, etc.).
- Questions should reflect what a knowledgeable educator or interviewer in this subject area would actually ask.

DIFFICULTY CALIBRATION
  easy:
    - Target: foundational concepts, definitions, and core facts.
    - Typical question forms: "What is X?", "How does X work?", "What is the difference between X and Y?"
    - Answers: clear and concise (2–3 sentences). No jargon that requires prior explanation.

  medium:
    - Target: applied knowledge, comparisons, cause-and-effect relationships, and real-world scenarios.
    - Typical question forms: "When would you use X over Y?", "What are the trade-offs of X?", "Why did X lead to Y?", "How would you approach X?"
    - Answers: include reasoning and practical or historical context (3–5 sentences). Explain the "why", not just the "what".

  hard:
    - Target: advanced synthesis, nuanced analysis, systemic implications, contested interpretations, and real-world consequences relevant to the subject.
    - Typical question forms: "How would you design X at scale?", "What failure modes does X have?", "What are the long-term implications of X?", "How does X relate to Y in the context of Z?", "What are the strongest arguments against X?"
    - Answers: reflect deep expertise (4–6 sentences). Discuss constraints, competing perspectives, and real-world consequences.

  mixed:
    - Generate an equal distribution: roughly one-third easy, one-third medium, one-third hard.
    - Each individual question must declare its own difficulty in the "difficulty" field.
    - The mix should span from foundational definitions to advanced analysis — not just medium questions relabelled as easy or hard.

ANSWER QUALITY
- Answers must be accurate and self-contained — a learner reading the answer should fully understand the concept.
- For easy questions: define the term or concept, then give one concrete example or analogy.
- For medium questions: explain the mechanism or reasoning, state the trade-off or significance, and give a practical or real-world use case.
- For hard questions: explain the underlying mechanism or argument, discuss failure modes, edge cases, or systemic implications, and describe how a domain expert would approach the problem in practice.

EXAMPLE RULE
{{CODE_EXAMPLE_RULE}}
