import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compareSync, hashSync } from "bcryptjs";

const DUMMY_HASH = hashSync("dummy", 12);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Look up the user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        const passwordMatch = user
          ? compareSync(credentials.password, user.password)
          : compareSync(credentials.password, DUMMY_HASH);

        if (!user) return null;

        if (!passwordMatch) {
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Persist the user's id and emailVerified status inside the JWT so the
     * middleware can access them without a DB round-trip on every request.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = (user as unknown as Record<string, unknown>).emailVerified as Date | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id;
        (session.user as unknown as Record<string, unknown>).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
};
