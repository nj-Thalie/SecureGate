import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimiter";

const handler = NextAuth(authOptions);

async function wrappedHandler(req: Request, context: unknown) {
  const url = new URL(req.url);
  if (url.pathname.includes("callback/credentials")) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    try {
      await enforceRateLimit(ip, "login");
    } catch (e) {
      const err = e as { status?: number };
      if (err.status === 429) {
        return Response.json(
          { error: "Too many attempts. Please try again later." },
          { status: 429 }
        );
      }
      throw e;
    }
  }
  return handler(req, context);
}

export { wrappedHandler as GET, wrappedHandler as POST };
