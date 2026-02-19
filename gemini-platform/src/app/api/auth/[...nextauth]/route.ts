
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";
import clsx from 'clsx'; // ensure module is valid, though not strictly needed for auth logic, keeping helper imports minimal

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const result = await query("SELECT * FROM users WHERE email = $1", [credentials.email]);
        const user = result?.rows[0];

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: { // Custom pages
    signIn: "/auth/login",
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
