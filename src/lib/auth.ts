import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/lib/db"; // Adjust import path for Prisma
import { PrismaAdapter } from "@auth/prisma-adapter";
import { nanoid } from "nanoid";
import { authPages } from "./utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  pages: { signIn: authPages.signIn },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.username = token.username as string; // Ensure username is set
        session.user.bio = token.bio as string;
        session.user.role = token.role as "ADMIN" | "GUEST";
      }

      return session;
    },

    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        token.id = user!.id;
        return token;
      }

      if (!dbUser.username) {
        const newUsername = nanoid(10);
        await db.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            username: newUsername,
          },
        });
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        username: dbUser.username,
        role: dbUser.ROLE,
        bio: dbUser.bio,
      };
    },

    redirect() {
      return "/";
    },
  },
});
