import NextAuth, {
  AuthOptions,
  User as NextAuthUser,
  Account,
  Profile,
  Session,
  JWT,
} from "next-auth";

import type { CallbacksOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/app/prisma";
import bcryptjs from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
    };
  }

  interface JWT {
    id?: string;
    username?: string | null;
    email?: string | null;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Sign In",
      credentials: {
        usernameOrEmail: {
          label: "Username or Email",
          type: "text",
          placeholder: "username or jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          console.log("No username/email or password provided for credentials login.");
          return null;
        }

        const usernameOrEmail = String(credentials.usernameOrEmail).toLowerCase();
        const password = String(credentials.password);

        try {
          let user: Awaited<ReturnType<typeof prisma.user.findUnique>> | null = null;

          if (usernameOrEmail.includes('@')) {
            user = await prisma.user.findUnique({
              where: { email: usernameOrEmail },
            });
          } else {
            user = await prisma.user.findFirst({
              where: { username: usernameOrEmail },
            });
          }

          if (!user || !user.password) {
            console.log("No user found with that username/email, or password not set.");
            return null;
          }

          const isValidPassword = await bcryptjs.compare(password, user.password);

          if (!isValidPassword) {
            console.log("Invalid password for user:", usernameOrEmail);
            return null;
          }

          console.log("User authenticated successfully:", user.email);
          return {
            id: user.id,
            name: user.username || user.email,
            email: user.email,
            username: user.username,
          } as NextAuthUser;
        } catch (error) {
          console.error("Error during credentials authorization:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt(params: Parameters<CallbacksOptions["jwt"]>[0]) {
      const { token, user, account, profile, trigger, isNewUser, session } = params;

      if (user) {
        token.id = user.id;

        if ('username' in user && user.username !== undefined) {
             token.username = user.username;
        } else if (user.name) {
            token.username = user.name;
        }
        token.email = user.email;
      }

      if (trigger === "update" && session?.user?.username) {
        token.username = session.user.username;
      }

      return token;
    },
    async session(params: Parameters<CallbacksOptions["session"]>[0]) {
      const { session, token, user } = params;

      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.username) {
        session.user.username = token.username as string;
      }
      if (token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);