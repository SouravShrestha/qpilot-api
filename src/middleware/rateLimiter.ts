import { getCorsHeaders } from "../lib/cors";
import { KVCacheRepository } from "../repositories/kv-cache.repository";
import { Middleware } from "../lib/router";

type RateLimitMeta = { count: number; windowStart: number };

export const checkRateLimit: Middleware = async (request, env) => {
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) {
    return new Response(JSON.stringify({ success: false, message: "Unable to determine client identity" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...getCorsHeaders() },
    });
  }

  const maxRequests = parseInt(env.RATE_LIMIT_MAX || "100", 10);
  const windowSeconds = parseInt(env.RATE_LIMIT_WINDOW_SECONDS || "60", 10);
  const ttl = Math.max(windowSeconds, 60);
  const now = Date.now();
  const key = `rl:${ip}`;

  const repo = new KVCacheRepository(env.QA_CACHE);
  const { metadata: meta } = await repo.getWithMetadata<string, RateLimitMeta>(key);

  if (meta && now - meta.windowStart < windowSeconds * 1000) {
    if (meta.count >= maxRequests) {
      return new Response(JSON.stringify({ success: false, message: "Rate limit exceeded" }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...getCorsHeaders() },
      });
    }
    await repo.put(key, "", {
      expirationTtl: ttl,
      metadata: { count: meta.count + 1, windowStart: meta.windowStart },
    });
  } else {
    await repo.put(key, "", {
      expirationTtl: ttl,
      metadata: { count: 1, windowStart: now },
    });
  }
};
