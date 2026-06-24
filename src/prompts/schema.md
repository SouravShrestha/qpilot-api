RESPONSE SCHEMA:

On success, return exactly this shape:
{
  "validation_reasoning": "<why the topic passed all 3 validation rules>",
  "success": true,
  "topic": "{{topic}}",
  "difficulty": "{{difficulty}}",
  "definition": "<a concise 1–2 sentence definition of the topic>",
  "recommendations": ["<related topic 1>", "<related topic 2>", "<related topic 3>", "<related topic 4>", "<related topic 5>"],
  "questions": [
    {
      "id": 1,
      "question": "<the interview question>",
      "answer": "<the model answer>",
      "difficulty": "<easy, medium, or hard — never mixed>",
      "example": {
        "type": "<code or text>",
        "content": "<the example content>"
      }
    }
  ]
}

Note: The "difficulty" on each question must always be "easy", "medium", or "hard" — never "mixed".
Note: The "example" field is either a valid object (as above) or absent entirely — never null, never an empty object.
Note: "definition" is a short, plain-English description of the topic (1–2 sentences).
Note: "recommendations" must always be exactly 5 strings — each a closely related topic the user might want to explore next.

---

On failure, return exactly this shape:
{
  "validation_reasoning": "<which rule failed and why>",
  "success": false,
  "errorCode": "<INVALID_DIFFICULTY | UNSUPPORTED_TOPIC | TOPIC_TOO_BROAD>",
  "message": "<human-readable explanation>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>", "<suggestion 5>"]
}

Note: Always provide exactly 5 suggestions. For INVALID_DIFFICULTY they are the 4 valid values. For topic errors they are 5 specific, relevant narrower topics.

---

FULL SUCCESS EXAMPLE (topic: "Docker", difficulty: "easy", includeExamples: true):
{
  "validation_reasoning": "Docker is a specific containerisation platform — a concrete, well-scoped topic.",
  "success": true,
  "topic": "Docker",
  "difficulty": "easy",
  "definition": "Docker is an open-source platform that enables developers to package applications and their dependencies into portable, isolated containers that run consistently across environments.",
  "recommendations": ["Kubernetes", "Docker Compose", "Container Security", "Podman", "CI/CD Pipelines"],
  "questions": [
    {
      "id": 1,
      "question": "What is the difference between a Docker image and a Docker container?",
      "answer": "A Docker image is a read-only, immutable template built from a Dockerfile that contains the application code, runtime, libraries, and configuration. A container is a running instance of that image — a lightweight, isolated process with its own filesystem and network namespace. You can run many containers from the same image simultaneously.",
      "difficulty": "easy",
      "example": {
        "type": "code",
        "content": "```bash\n# Build an image from a Dockerfile\ndocker build -t my-app .\n\n# Run a container from that image\ndocker run -d -p 3000:3000 my-app\n```"
      }
    }
  ]
}

---

FULL SUCCESS EXAMPLE (topic: "The French Revolution", difficulty: "easy", includeExamples: true):
{
  "validation_reasoning": "The French Revolution is a specific, well-defined historical event — not too broad and not incoherent.",
  "success": true,
  "topic": "The French Revolution",
  "difficulty": "easy",
  "definition": "The French Revolution (1789–1799) was a period of radical political and social transformation in France that overthrew the monarchy, established a republic, and fundamentally reshaped European politics and society.",
  "recommendations": ["The Reign of Terror", "Napoleon Bonaparte", "The Enlightenment", "The American Revolution", "The Congress of Vienna"],
  "questions": [
    {
      "id": 1,
      "question": "What were the three main social classes in pre-revolutionary France, and why did their structure contribute to the Revolution?",
      "answer": "Pre-revolutionary France was divided into the First Estate (clergy), Second Estate (nobility), and Third Estate (everyone else — peasants, urban workers, and the bourgeoisie). The Third Estate comprised roughly 97% of the population but paid the vast majority of taxes and had almost no political representation. This deep inequality, combined with Enlightenment ideas about individual rights and popular sovereignty, created the conditions for revolt.",
      "difficulty": "easy",
      "example": {
        "type": "text",
        "content": "Imagine a company where 97% of employees do all the work and pay all costs, while 3% of managers are exempt from taxes and hold all decision-making power. The resentment that builds over time mirrors the social pressures that exploded in 1789."
      }
    }
  ]
}
