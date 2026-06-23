import { ExecutionContext } from "@cloudflare/workers-types";
import { Env } from "./types";
import { handleOptions } from "./lib/cors";
import { Router } from "./lib/router";
import { withErrorHandler } from "./middleware/errorHandler";
import { authenticate } from "./middleware/auth";
import { checkRateLimit } from "./middleware/rateLimiter";
import { createValidator } from "./middleware/validator";
import { handleNotFound } from "./middleware/notFound";
import { handleHealthCheck } from "./handlers/v1/health";
import { handleGenerate } from "./handlers/v1/generate";
import { handleFavicon } from "./handlers/favicon";

const router = new Router();

// Favicon
router.get("/favicon.ico", handleFavicon);
router.get("/favicon.png", handleFavicon);

const generateSchema = {
  topic: {
    required: true,
    type: "string" as const,
    custom: (val: string, env: Env) => {
      if (val.trim().length === 0) return "Field 'topic' must not be empty";
      if (val.length > 100) return "Field 'topic' must be 100 characters or fewer";
      return null;
    },
  },
  difficulty: {
    required: true,
    type: "string" as const,
    custom: (val: string) =>
      ["easy", "medium", "hard", "mixed"].includes(val)
        ? null
        : "Field 'difficulty' must be one of: easy, medium, hard, mixed",
  },
  limit: {
    type: "number" as const,
    custom: (val: number, env: Env) => {
      const max = parseInt(env.MAX_LIMIT || "50", 10);
      if (!Number.isInteger(val) || val < 1) return "Field 'limit' must be a positive integer";
      if (val > max) return `Field 'limit' must not exceed ${max}`;
      return null;
    },
  },
  offset: {
    type: "number" as const,
    custom: (val: number) => {
      if (!Number.isInteger(val) || val < 0) return "Field 'offset' must be a non-negative integer";
      return null;
    },
  },
};

// v1 routes
router.get("/v1/health", handleHealthCheck);

router.post(
  "/v1/generate",
  createValidator(generateSchema),
  authenticate,
  checkRateLimit,
  handleGenerate
);

// Catch-all
router.all(/.*/, handleNotFound);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
    return withErrorHandler(() => router.handle(request, env, ctx));
  },
};
