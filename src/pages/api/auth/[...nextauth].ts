import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
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
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // EmailProvider({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    //   maxAge: 24 * 60 * 60,
    // }),
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
          let user = null;

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
            name: user.username,
            email: user.email,
            username: user.username,
            // image: user.image,
          };
        } catch (error) {
          console.error("Error during credentials authorization:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; 
        token.email = user.email;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  // You can define custom pages here for sign-in, error, etc.
  pages: {
     signIn: "/auth/login", // Example: if you have a custom sign-in page at pages/auth/signin.tsx
  //   error: "/auth/error", // Error code passed in query string as ?error=
   },
   secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Debug mode (turn off in production)
};

export default NextAuth(authOptions);