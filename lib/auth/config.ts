import { AuthOptions, DefaultSession } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: number;
      stripeCustomerId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    stripeCustomerId?: string | null;
  }
}

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, Number(token.sub)),
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.stripeCustomerId = dbUser.stripeCustomerId;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = String(user.id);
      }
      return token;
    },
  },
};
