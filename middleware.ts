import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * withAuth wraps the middleware and provides the decoded JWT token
 * on `req.nextauth.token`. The `authorized` callback is the single gate:
 *   - return false  → NextAuth redirects to pages.signIn (/login)
 *   - return true   → request continues
 *
 * We block access unless:
 *   1. A valid JWT token exists (user is authenticated), AND
 *   2. token.emailVerified is set (user has verified their email)
 */
export default withAuth(
  function middleware() {
    // At this point the token is valid and email is verified.
    // We can attach headers or run additional logic here if needed.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // token is null if the user is not authenticated
        if (!token) return false;
        // emailVerified must be a truthy value (DateTime set by Prisma)
        if (!token.emailVerified) return false;
        return true;
      },
    },
    pages: {
      signIn: "/auth",
    },
  }
);

export const config = {
  // Only run middleware on /dashboard and all nested routes
  matcher: ["/dashboard/:path*"],
};
