import { getCorsHeaders } from "../lib/cors";
import { RouteHandler } from "../lib/router";

export const handleNotFound: RouteHandler = () => {
  return new Response(JSON.stringify({ success: false, message: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...getCorsHeaders() },
  });
};
