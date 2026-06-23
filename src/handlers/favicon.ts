import logoBuffer from "../assets/logo.png";
import { RouteHandler } from "../lib/router";

export const handleFavicon: RouteHandler = async () => {
  return new Response(logoBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
