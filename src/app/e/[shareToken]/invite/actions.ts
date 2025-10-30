"use server"

import { auth } from "@/auth"
import { db } from "@/db/client"
import { eventInvites, events } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { customAlphabet } from "nanoid"
import { z } from "zod"
import { sendInviteEmail } from "@/lib/email"

const nano = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  21
)

const AddInvitesInput = z.object({
  shareToken: z.string().min(6),
  emails: z.string().min(3), // comma/space/newline separated
})

export async function addInvitesAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (!db) throw new Error("Database not configured")

  const parsed = AddInvitesInput.safeParse({
    shareToken: String(formData.get("shareToken") ?? ""),
    emails: String(formData.get("emails") ?? ""),
  })
  if (!parsed.success)
    throw new Error(parsed.error.issues.map((i) => i.message).join("\n"))

  const { shareToken, emails } = parsed.data

  const [ev] = await db
    .select()
    .from(events)
    .where(eq(events.shareToken, shareToken))
    .limit(1)
  if (!ev) throw new Error("Event not found")
  if (ev.ownerId !== session.user.id) throw new Error("Forbidden")

  const list = emails
    .split(/[\n,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!list.length) throw new Error("No emails provided")

  const values = list.map((email) => ({
    eventId: ev.id,
    email,
    inviteToken: nano(),
  }))
  await db.insert(eventInvites).values(values).onConflictDoNothing()

  const base = process.env.NEXTAUTH_URL || "http://localhost:3000"
  await Promise.all(
    values.map(async (v) => {
      const url = `${base}/i/${v.inviteToken}`
      await sendInviteEmail({
        to: v.email,
        from: process.env.EMAIL_FROM!,
        subject: `You're invited: ${ev.title}`,
        html: `
          <p>You have been invited to <strong>${ev.title}</strong>.</p>
          <p>Date: ${new Date(ev.startsAt).toLocaleString()}</p>
          <p>Location: ${ev.locationText ?? "TBA"}</p>
          <p>Open your invite: <a href="${url}">${url}</a></p>
        `,
      })
    })
  )

  revalidatePath(`/e/${shareToken}`)
  return { ok: true } as const
}
