import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      username?: string | null;
      bio?: string | null;
      role?: "GUEST" | "ADMIN";
    };
  }
}
