"use server"

import { auth } from "@/auth"
import { db } from "@/db/client"
import { comments, events } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CommentInput = z.object({
  shareToken: z.string().min(5),
  text: z
    .string()
    .min(1, "Say something first")
    .max(800, "Keep it under 800 chars"),
})

export async function addCommentAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Parse
  const parsed = CommentInput.safeParse({
    shareToken: String(formData.get("shareToken") ?? ""),
    text: String(formData.get("text") ?? "").trim(),
  })
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("\n")
    throw new Error(msg)
  }

  if (!db) {
    // Mock mode: no DB. We can't persist; just revalidate to refetch.
    revalidatePath(`/e/${parsed.data.shareToken}`)
    return { ok: true } as const
  }

  // Find event id by token
  const [ev] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.shareToken, parsed.data.shareToken))
    .limit(1)

  if (!ev) throw new Error("Event not found")

  await db.insert(comments).values({
    eventId: ev.id,
    userId: session.user.id,
    body: parsed.data.text,
  })

  // Revalidate event page so SSR picks up the new comment
  revalidatePath(`/e/${parsed.data.shareToken}`)
  return { ok: true } as const
}
