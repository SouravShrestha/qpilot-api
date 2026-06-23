export function getCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key, X-LLM-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleOptions(request: Request): Response {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    return new Response(null, { headers: getCorsHeaders() });
  }

  return new Response(null, {
    headers: { Allow: "GET, POST, OPTIONS" },
  });
}
