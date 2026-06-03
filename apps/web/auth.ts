import { dbRoleToAppRole } from "@uyanik/tokens";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { resolveUserByEmail } from "./lib/auth/resolve-user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await resolveUserByEmail(email);
        if (!user) {
          return null;
        }

        const passwordValid = await compare(password, user.passwordHash);
        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: dbRoleToAppRole[user.role],
          organizationId: user.organizationId,
          branchId: user.branchId,
          studentId: user.studentId ?? null,
          coachId: user.coachId ?? null,
          parentId: user.parentId ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.role) {
        return false;
      }

      user.organizationId = user.organizationId ?? null;
      user.branchId = user.branchId ?? null;
      user.studentId = user.studentId ?? null;
      user.coachId = user.coachId ?? null;
      user.parentId = user.parentId ?? null;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId ?? null;
        token.branchId = user.branchId ?? null;
        token.studentId = user.studentId ?? null;
        token.coachId = user.coachId ?? null;
        token.parentId = user.parentId ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
        session.user.role = token.role as typeof session.user.role;
        session.user.organizationId = token.organizationId ?? null;
        session.user.branchId = token.branchId ?? null;
        session.user.studentId = token.studentId ?? null;
        session.user.coachId = token.coachId ?? null;
        session.user.parentId = token.parentId ?? null;
      }

      return session;
    },
  },
});
