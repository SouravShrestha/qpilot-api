VALIDATION RULES (evaluate in order, stop at first failure):

The field "validation_reasoning" is ALWAYS required in your response — whether success or failure — and must briefly explain your ruling.

---

RULE 1 — DIFFICULTY CHECK
Valid values: easy, medium, hard, mixed (case-insensitive).
If invalid, return:
{ "success": false, "errorCode": "INVALID_DIFFICULTY", "message": "Difficulty must be one of: easy, medium, hard, or mixed.", "suggestions": ["easy", "medium", "hard", "mixed"] }

---

RULE 2 — TOPIC RELEVANCE CHECK
A topic is VALID if it belongs to any of the following domains:
- Programming languages, frameworks, and libraries (React, Rust, Spring Boot, etc.)
- Databases and storage (PostgreSQL, Redis, Elasticsearch, etc.)
- Infrastructure and cloud (AWS Lambda, Kubernetes, Terraform, etc.)
- DevOps and CI/CD (GitHub Actions, Docker, Ansible, ArgoCD, etc.)
- Data engineering and pipelines (Apache Kafka, Spark, Airflow, dbt, etc.)
- Security (JWT, OAuth 2.0, OWASP, TLS, etc.)
- Software architecture and design patterns (CQRS, Event Sourcing, Repository Pattern, etc.)
- Engineering concepts (Database Indexing, WebSockets, Rate Limiting, etc.)
- Computer science fundamentals (Algorithms, Data Structures, Big-O, OS concepts, etc.)

A topic is INVALID if it is:
- A general non-technical subject (mathematics, history, cooking, fitness, finance, etc.)
- A soft-skill or business role (communication, leadership, product management, sales, etc.)
- Completely unrelated to building or operating software systems

If invalid, return:
{ "success": false, "errorCode": "UNSUPPORTED_TOPIC", "message": "Only software engineering topics are supported.", "suggestions": ["React Hooks", "Docker", "Redis", "JWT Authentication", "Microservices"] }

---

RULE 3 — SPECIFICITY CHECK
A topic is TOO BROAD if it:
- Describes a job role or skill set ("Software Engineer", "Frontend Developer", ".NET Fullstack")
- Spans multiple unrelated technologies ("Web Development", "Cloud Computing", "Full Stack")
- Is a high-level paradigm with no concrete technology anchor ("Programming", "Coding", "Software Development")

A topic is SPECIFIC ENOUGH if it identifies:
- A single language, framework, or library ("React", "Rust", "Django")
- A single tool or platform ("Docker", "Redis", "Terraform", "GitHub Actions")
- A single cloud service ("AWS Lambda", "Azure Service Bus", "GCP Pub/Sub")
- A single design/architecture pattern ("CQRS", "Saga Pattern", "Event Sourcing")
- A single engineering concept ("Database Indexing", "JWT Authentication", "WebSockets")

If too broad, return:
{ "success": false, "errorCode": "TOPIC_TOO_BROAD", "message": "Please enter a more specific topic.", "suggestions": [ /* 5 relevant, narrower topics derived from the broad input */ ] }

---

VALIDATION EXAMPLES:

Input: "React Hooks"
→ validation_reasoning: "React Hooks is a specific technical feature within the React framework."
→ success: true

Input: "AWS Lambda"
→ validation_reasoning: "AWS Lambda is a specific serverless compute service from AWS."
→ success: true

Input: "GitHub Actions"
→ validation_reasoning: "GitHub Actions is a specific CI/CD platform — DevOps tooling is a valid domain."
→ success: true

Input: "Apache Kafka"
→ validation_reasoning: "Apache Kafka is a specific distributed event streaming platform."
→ success: true

Input: "Web Development"
→ validation_reasoning: "Web Development is a broad domain spanning many unrelated technologies and disciplines."
→ success: false, errorCode: "TOPIC_TOO_BROAD"
→ suggestions: ["React", "Next.js", "REST API Design", "CSS Grid", "HTTP/2"]

Input: ".NET Fullstack"
→ validation_reasoning: ".NET Fullstack describes a broad skill set across multiple layers, not a single specific technology."
→ success: false, errorCode: "TOPIC_TOO_BROAD"
→ suggestions: ["ASP.NET Core", "Entity Framework Core", "Blazor", "SignalR", "LINQ"]

Input: "Cloud Computing"
→ validation_reasoning: "Cloud Computing is an umbrella term spanning dozens of unrelated services and providers."
→ success: false, errorCode: "TOPIC_TOO_BROAD"
→ suggestions: ["AWS EC2", "Azure Kubernetes Service", "Google Cloud Run", "Terraform", "AWS IAM"]

Input: "Cooking"
→ validation_reasoning: "Cooking is not related to software engineering."
→ success: false, errorCode: "UNSUPPORTED_TOPIC"
