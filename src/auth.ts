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
      apiKey: process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM!,
      async sendVerificationRequest({ identifier, url, provider }) {
        try {
          const { host } = new URL(url)
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${provider.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: provider.from,
              to: identifier,
              subject: `Sign in to ${host}`,
              html: `<p>Click <a href="${url}">here</a> to sign in.</p>`,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(
              `Failed to send verification email: ${JSON.stringify(error)}`
            )
          }
        } catch (error) {
          console.error("Error sending verification email:", error)
          throw error
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
})
