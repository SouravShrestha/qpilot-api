import { getCorsHeaders } from "../lib/cors";
import { Env } from "../types";
import { Middleware } from "../lib/router";

export const authenticate: Middleware = (request, env) => {
  const providedKey = request.headers.get("X-API-Key");

  if (!providedKey) {
    return new Response(JSON.stringify({ success: false, message: "Missing API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...getCorsHeaders() },
    });
  }

  const encoder = new TextEncoder();
  const a = encoder.encode(providedKey);
  const b = encoder.encode(env.APP_API_KEY);

  if (a.byteLength !== b.byteLength || !crypto.subtle.timingSafeEqual(a, b)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...getCorsHeaders() },
    });
  }
};
