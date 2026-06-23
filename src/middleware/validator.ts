import { getCorsHeaders } from "../lib/cors";
import { Env } from "../types";
import { Middleware } from "../lib/router";

export type FieldRules = {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "object";
  custom?: (value: any, env: Env) => string | null;
};

export type ValidationSchema = Record<string, FieldRules>;

export function createValidator(schema: ValidationSchema): Middleware {
  return async (request: Request, env: Env) => {
    let body: Record<string, unknown> = {};

    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const cloned = request.clone();
        body = await cloned.json();
      } catch {
        return new Response(JSON.stringify({ success: false, message: "Invalid JSON body" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...getCorsHeaders() },
        });
      }
    }

    for (const [key, rules] of Object.entries(schema)) {
      const value = body[key];

      if (rules.required && (value === undefined || value === null)) {
        return new Response(
          JSON.stringify({ success: false, message: `Missing required field: '${key}'` }),
          { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders() } }
        );
      }

      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          return new Response(
            JSON.stringify({ success: false, message: `Invalid type for '${key}': expected ${rules.type}` }),
            { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders() } }
          );
        }

        if (rules.custom) {
          const error = rules.custom(value, env);
          if (error) {
            return new Response(
              JSON.stringify({ success: false, message: error }),
              { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders() } }
            );
          }
        }
      }
    }
  };
}
