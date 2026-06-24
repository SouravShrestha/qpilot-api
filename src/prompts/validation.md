VALIDATION RULES (evaluate in order, stop at first failure):

The field "validation_reasoning" is ALWAYS required in your response — whether success or failure — and must briefly explain your ruling.

---

RULE 1 — DIFFICULTY CHECK
Valid values: easy, medium, hard, mixed (case-insensitive).
If invalid, return:
{ "success": false, "errorCode": "INVALID_DIFFICULTY", "message": "Difficulty must be one of: easy, medium, hard, or mixed.", "suggestions": ["easy", "medium", "hard", "mixed"] }

---

RULE 2 — TOPIC RELEVANCE CHECK
A topic is VALID if it is a genuine subject of human knowledge or skill that a person could meaningfully study. This includes, but is not limited to:
- Academic disciplines and their sub-fields (mathematics, physics, history, biology, philosophy, linguistics, economics, psychology, etc.)
- Applied and professional fields (medicine, law, engineering, architecture, finance, nutrition, education, etc.)
- Creative and performing arts (music theory, film studies, visual art history, literature, creative writing, etc.)
- Practical skills and crafts (cooking techniques, woodworking, photography, gardening, etc.)
- Sports, games, and strategy (chess, football tactics, poker theory, etc.)
- Technology and computing (software engineering, data science, cybersecurity, etc.)

A topic is INVALID only if it is:
- Completely incoherent or nonsensical (random characters, gibberish strings, meaningless word salad)
- Explicitly harmful or designed to extract dangerous information (e.g., "how to synthesise illegal substances", "methods of violence")
- Not a learnable subject at all (e.g., a person's private name, a random number, a URL)

If invalid, return:
{ "success": false, "errorCode": "UNSUPPORTED_TOPIC", "message": "This does not appear to be a learnable topic. Please enter a genuine subject, discipline, or skill.", "suggestions": ["The French Revolution", "Calculus — Derivatives", "Music Theory — Chord Progressions", "Human Anatomy — The Cardiovascular System", "Docker Containerisation"] }

---

RULE 3 — SPECIFICITY CHECK
A topic is TOO BROAD if it:
- Describes a sweeping meta-category that contains dozens of unrelated sub-disciplines ("Science", "History", "Art", "Technology", "Sport", "Engineering")
- Names a broad academic department rather than a specific concept, event, person, period, or technique ("Mathematics", "Philosophy", "Medicine", "Literature")
- Describes a job role or skill set ("Doctor", "Software Engineer", "Chef", "Lawyer")
- Is a high-level paradigm with no concrete anchor ("Learning", "Education", "Knowledge")

A topic is SPECIFIC ENOUGH if it identifies:
- A single historical event, period, or figure ("The French Revolution", "The Apollo 11 Mission", "Napoleon Bonaparte's military campaigns")
- A single scientific concept, law, or theory ("Quantum Entanglement", "Natural Selection", "The Krebs Cycle")
- A single mathematical concept or method ("Bayesian Inference", "Linear Algebra — Eigenvalues", "Differential Calculus")
- A single composer, movement, or music theory concept ("Beethoven's Fifth Symphony", "Jazz Harmony", "Counterpoint")
- A single medical condition, system, or procedure ("Type 2 Diabetes", "The Human Immune System", "Cognitive Behavioural Therapy")
- A single language or linguistic concept ("Mandarin Chinese — Tonal System", "Latin Grammar — Subjunctive Mood", "Code-Switching")
- A single culinary technique, cuisine, or concept ("The Maillard Reaction", "French Pastry Techniques", "Fermentation in Cooking")
- A single software tool, language, pattern, or engineering concept ("React Hooks", "Docker", "CQRS", "Database Indexing")
- A single philosophical concept or argument ("Kant's Categorical Imperative", "Stoicism", "The Problem of Evil")

If too broad, return:
{ "success": false, "errorCode": "TOPIC_TOO_BROAD", "message": "Please enter a more specific topic.", "suggestions": [ /* 5 relevant, narrower topics derived from the broad input */ ] }

---

VALIDATION EXAMPLES:

Input: "The French Revolution"
→ validation_reasoning: "The French Revolution is a specific, well-defined historical event with a clear scope."
→ success: true

Input: "Quantum Entanglement"
→ validation_reasoning: "Quantum Entanglement is a specific physics concept with a defined scope."
→ success: true

Input: "The Maillard Reaction"
→ validation_reasoning: "The Maillard Reaction is a specific chemical process in cooking — a concrete, learnable concept."
→ success: true

Input: "React Hooks"
→ validation_reasoning: "React Hooks is a specific feature of the React framework."
→ success: true

Input: "History"
→ validation_reasoning: "History is a sweeping meta-category containing thousands of unrelated events, periods, and sub-disciplines."
→ success: false, errorCode: "TOPIC_TOO_BROAD"
→ suggestions: ["The French Revolution", "World War II — The Pacific Theatre", "The Roman Republic", "The Cold War", "The Renaissance"]

Input: "Science"
→ validation_reasoning: "Science is an umbrella term for dozens of unrelated disciplines."
→ success: false, errorCode: "TOPIC_TOO_BROAD"
→ suggestions: ["Quantum Entanglement", "Natural Selection", "The Periodic Table", "The Theory of General Relativity", "CRISPR Gene Editing"]

Input: "Mathematics"
→ validation_reasoning: "Mathematics is a broad academic department, not a specific concept or method."
→ success: false, errorCode: "TOPIC_TOO_BROAD"
→ suggestions: ["Bayesian Inference", "Linear Algebra — Eigenvalues", "Differential Calculus", "Graph Theory", "Number Theory — Prime Numbers"]

Input: "xkqz$$4!!"
→ validation_reasoning: "This is incoherent gibberish and does not correspond to any learnable topic."
→ success: false, errorCode: "UNSUPPORTED_TOPIC"
