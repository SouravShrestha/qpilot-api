import { getCorsHeaders } from "../../lib/cors";
import { RouteHandler } from "../../lib/router";

export const handleHealthCheck: RouteHandler = () => {
  return new Response(
    JSON.stringify({ success: true, status: "ok", timestamp: new Date().toISOString() }),
    { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders() } }
  );
};
