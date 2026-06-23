RESPONSE SCHEMA:

On success, return exactly this shape:
{
  "validation_reasoning": "<why the topic passed all 3 validation rules>",
  "success": true,
  "topic": "{{topic}}",
  "difficulty": "{{difficulty}}",
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
  "validation_reasoning": "Docker is a specific containerisation platform — a valid, specific software engineering topic.",
  "success": true,
  "topic": "Docker",
  "difficulty": "easy",
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
