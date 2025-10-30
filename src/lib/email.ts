import { Resend } from "resend"

const resendKey = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY
const resend = resendKey ? new Resend(resendKey) : null

export async function sendInviteEmail({
  to,
  from,
  subject,
  html,
}: {
  to: string
  from: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.log("[DEV invite email]", { to, subject, html })
    return { id: "dev" } as const
  }
  return await resend.emails.send({ to, from, subject, html })
}
