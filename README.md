# QPilot API

QPilot is an LLM-powered question generation service built on Cloudflare Workers. Given any learning topic and a difficulty level, it returns a set of study-ready questions and answers, a short definition of the topic, and five related topics to explore next.

Topics can span any genuine subject — history, science, mathematics, cooking, music theory, medicine, languages, philosophy, software engineering, and more.

---

## Features

- **Universal topic support** — any coherent, learnable subject is accepted. Overly broad inputs ("History", "Science") are rejected with narrowing suggestions.
- **Difficulty levels** — `easy`, `medium`, `hard`, or `mixed`. Each question carries its own difficulty field, which is useful when requesting `mixed`.
- **Topic definition** — every response includes a concise 1–2 sentence definition of the requested topic.
- **Recommendations** — every response includes five related topics to explore next.
- **Accumulative caching** — questions are cached per topic/difficulty combination and grown progressively. Requests within the cached pool are served instantly without calling the LLM.
- **Pagination** — use `offset` and `limit` to page through the cached question pool.
- **Optional examples** — answers can include code snippets (for technical topics) or text-based analogies and scenarios.

---

## Authentication

All requests require an `X-API-Key` header.

```
X-API-Key: <your-api-key>
```

To use a personal LLM API key instead of the server's default, pass it in the `X-LLM-API-Key` header.

---

## API Reference

### Health Check

**GET** `/v1/health`

Returns the health status of the API.

---

### Generate Questions

**POST** `/v1/generate`

Generates or retrieves questions for a given topic and difficulty.

#### Request Body

```json
{
  "topic": "The French Revolution",
  "difficulty": "medium",
  "includeExamples": true,
  "limit": 10,
  "offset": 0
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `topic` | string | Yes | The subject to generate questions about. Must be a specific, learnable topic (max 100 characters). |
| `difficulty` | string | Yes | `easy`, `medium`, `hard`, or `mixed`. |
| `includeExamples` | boolean | No | Whether to include examples with each answer. Defaults to `true`. |
| `limit` | number | No | Number of questions to return (1–50). Defaults to `15`. |
| `offset` | number | No | Starting index for pagination. Defaults to `0`. |
| `forceRefresh` | boolean | No | If `true`, bypasses the cache and generates a fresh batch (deduplication against the existing cache is still applied). Defaults to `false`. |

#### Success Response

```json
{
  "success": true,
  "validation_reasoning": "The French Revolution is a specific, well-defined historical event with a clear scope.",
  "topic": "The French Revolution",
  "difficulty": "medium",
  "definition": "The French Revolution (1789–1799) was a period of radical political and social transformation in France that overthrew the monarchy, established a republic, and fundamentally reshaped European politics and society.",
  "recommendations": [
    "The Reign of Terror",
    "Napoleon Bonaparte",
    "The Enlightenment",
    "The American Revolution",
    "The Congress of Vienna"
  ],
  "questions": [
    {
      "id": 1,
      "question": "What role did Enlightenment philosophy play in driving the French Revolution?",
      "answer": "Enlightenment thinkers such as Rousseau, Voltaire, and Montesquieu challenged the divine right of kings and promoted ideas of individual liberty, popular sovereignty, and the social contract. These ideas gave the educated bourgeoisie an intellectual framework to question the legitimacy of absolute monarchy and the privileges of the clergy and nobility. The Declaration of the Rights of Man (1789) directly reflects these philosophical foundations.",
      "difficulty": "medium",
      "example": {
        "type": "text",
        "content": "Rousseau's concept of the 'general will' — that legitimate authority derives from the collective will of the people — was directly cited by revolutionary leaders to justify dismantling the monarchy."
      }
    }
  ]
}
```

#### Error Response

When the topic fails validation, the API returns an error with one of three error codes.

```json
{
  "success": false,
  "validation_reasoning": "History is a sweeping meta-category containing thousands of unrelated events, periods, and sub-disciplines.",
  "errorCode": "TOPIC_TOO_BROAD",
  "message": "Please enter a more specific topic.",
  "suggestions": [
    "The French Revolution",
    "World War II — The Pacific Theatre",
    "The Roman Republic",
    "The Cold War",
    "The Renaissance"
  ]
}
```

| Error Code | HTTP Status | Cause |
|---|---|---|
| `INVALID_DIFFICULTY` | 400 | `difficulty` is not one of the four valid values. |
| `TOPIC_TOO_BROAD` | 422 | The topic is a broad category rather than a specific concept, event, or subject. |
| `UNSUPPORTED_TOPIC` | 422 | The topic is incoherent, harmful, or not a learnable subject. |

---

## Caching Behaviour

Questions are cached per `(topic, difficulty, includeExamples)` combination with a configurable TTL (default 24 hours).

The cache grows over time. When you request questions beyond the current cached pool, the API generates only the additional questions needed and appends them. Subsequent requests within the cached range are served without calling the LLM. This means the first request for a topic is slower; subsequent requests are near-instant.

Use `offset` and `limit` to page through the pool:

```json
{ "topic": "Stoicism", "difficulty": "easy", "limit": 10, "offset": 0 }   // questions 1–10
{ "topic": "Stoicism", "difficulty": "easy", "limit": 10, "offset": 10 }  // questions 11–20
```

---

## Project Structure

```
src/
├── handlers/v1/        # Route handlers (generate, health)
├── lib/                # Router, CORS, prompt builder
├── middleware/         # Auth, rate limiter, validator, error handler
├── prompts/            # LLM prompt templates (persona, validation, generation, schema, etc.)
├── providers/          # LLM provider abstraction (Groq)
├── repositories/       # Cache interface and Cloudflare KV implementation
└── types.ts            # Shared TypeScript types
```

---

## Local Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npx wrangler dev
```
