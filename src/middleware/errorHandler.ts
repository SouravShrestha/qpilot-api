import { getCorsHeaders } from "../lib/cors";

export async function withErrorHandler(handler: () => Promise<Response> | Response): Promise<Response> {
  try {
    return await handler();
  } catch (error: any) {
    console.error("Unhandled exception:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...getCorsHeaders() },
    });
  }
}
