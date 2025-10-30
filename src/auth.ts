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
          console.log("Attempting to send verification email to:", identifier)
          console.log(
            "Using API key:",
            (process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY)?.slice(
              0,
              8
            ) + "..."
          )
          console.log("From address:", process.env.EMAIL_FROM)

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

          const data = await response.json()
          console.log("Resend API response:", data)

          if (!response.ok) {
            throw new Error("Failed to send verification email")
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
