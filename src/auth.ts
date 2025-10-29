import NextAuth from "next-auth"
import ResendProvider from "next-auth/providers/resend"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db/client"
import * as schema from "@/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: db
    ? DrizzleAdapter(db, {
        usersTable: schema.users,
        accountsTable: schema.accounts,
        sessionsTable: schema.sessions,
        verificationTokensTable: schema.verificationTokens,
      })
    : undefined,
  session: { strategy: "database" },
  //   session: { strategy: "jwt" },
  providers: [
    ResendProvider({
      // If you set AUTH_RESEND_KEY in .env, you can omit apiKey here.
      apiKey: process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM!, // e.g. "Corralio <noreply@yourdomain.com>"
      // Optional: customize the email body by providing sendVerificationRequest()
      // sendVerificationRequest({ identifier, url, provider, theme }) { ... }
    }),
  ],
  secret: process.env.AUTH_SECRET,
})
