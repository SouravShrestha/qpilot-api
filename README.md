# QPilot API

QPilot is an LLM-powered backend service built with Cloudflare Workers designed to generate and cache programming and technical questions on demand.

## Features

- **Dynamic Question Generation**: Automatically generates questions based on any provided software engineering topic.
- **Difficulty Levels**: Supports `easy`, `medium`, `hard`, and `mixed` difficulty questions. The difficulty is returned both at the summary level and for each individual question.
- **Accumulative Caching & Pagination**: Uses a smart caching layer with `offset` and `limit`. As you request more questions, new questions are generated and appended to the cache to progressively grow the pool. Requests within the cached length are served instantly without hitting the LLM.
- **Code Examples**: Questions can optionally include code snippets or text examples.

---

## Endpoint Documentation

### Health Check

Returns the health status of the API.

**GET** `/v1/health`

### Generate Questions

Generates or fetches questions based on the configuration provided in the JSON body.

**POST** `/v1/generate`

#### Request Body
```json
{
  "topic": "Docker",
  "difficulty": "medium", 
  "includeExamples": true,
  "offset": 0,
  "limit": 15
}
```

**Parameters:**
- `topic` *(string, required)*: The subject you want questions about (e.g., "React", "Docker", "Go").
- `difficulty` *(string, required)*: The difficulty level of the questions. Must be one of `easy`, `medium`, `hard`, or `mixed`.
- `includeExamples` *(boolean, optional)*: Whether the LLM should include code/text examples in the answers. Defaults to `true`.
- `offset` *(number, optional)*: The starting index for pagination. Used to fetch subsequent batches of questions from the cache. Defaults to `0`.
- `limit` *(number, optional)*: The number of questions to return. Defaults to `15`.
- `forceRefresh` *(boolean, optional)*: If `true`, ignores the current cache and forces the LLM to generate a fresh set of questions (it reads the old cache first to ensure no duplicates are made).

#### Response

The API returns a JSON response containing an array of questions. Each individual question explicitly states its difficulty level (useful when requesting `mixed`).

```json
{
  "success": true,
  "validation_reasoning": "Brief explanation of topic validation...",
  "topic": "Docker",
  "difficulty": "medium",
  "questions": [
    {
      "id": 1,
      "question": "What is the difference between a Docker image and a container?",
      "answer": "An image is a read-only template that contains a set of instructions...",
      "difficulty": "medium",
      "example": {
        "type": "code",
        "content": "docker run -it ubuntu bash"
      }
    }
  ]
}
```

---

## Project Structure

- `src/handlers/` - Request handlers for API routes (e.g., `v1/generate`, `v1/health`)
- `src/lib/` - Core libraries (router, cors)
- `src/middleware/` - Middlewares (auth, validator, errorHandler, rateLimiter)
- `src/prompts/` - LLM prompt templates
- `src/providers/` - Third-party integrations (e.g., LLM providers)
- `src/repositories/` - Data access layer (following the repository pattern with interfaces)
- `src/types.ts` - Shared TypeScript definitions

---

## Local Development

Install dependencies:
```bash
npm install
```

Start the local Cloudflare Worker development server:
```bash
npx wrangler dev
```
