"use server"

import { auth } from "@/auth"
import { db } from "@/db/client"
import { eventInvites, events, rsvps } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function respondInviteAction(formData: FormData) {
  if (!db) throw new Error("Database not configured")

  const token = String(formData.get("inviteToken") ?? "")
  const decision = String(formData.get("decision") ?? "") // "accepted" | "declined"
  const session = await auth()

  const [inv] = await db
    .select()
    .from(eventInvites)
    .where(eq(eventInvites.inviteToken, token))
    .limit(1)
  if (!inv) throw new Error("Invite not found")

  await db
    .update(eventInvites)
    .set({
      status:
        decision === "accepted"
          ? "accepted"
          : decision === "declined"
          ? "declined"
          : "pending",
      respondedAt: new Date(),
    })
    .where(eq(eventInvites.id, inv.id))

  // Upsert RSVP row
  const response =
    decision === "accepted" ? "yes" : decision === "maybe" ? "maybe" : "no"
  const email = inv.email // invited email
  const userId = session?.user?.id ?? null

  // Try update-if-exists first, then insert (simple approach; or use onConflictDoUpdate if you prefer)
  const existing = await db
    .select({ id: rsvps.id })
    .from(rsvps)
    .where(and(eq(rsvps.eventId, inv.eventId), eq(rsvps.email, email)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(rsvps)
      .set({ response, userId })
      .where(eq(rsvps.id, existing[0].id))
  } else {
    await db.insert(rsvps).values({
      eventId: inv.eventId,
      email,
      userId,
      response,
    })
  }

  // Gate cookie (allows viewing private event)
  const cookieStore = await cookies()
  cookieStore.set(`invite_access_${inv.eventId}`, "true", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  const [ev] = await db
    .select()
    .from(events)
    .where(eq(events.id, inv.eventId))
    .limit(1)
  if (!ev) throw new Error("Event missing")
  redirect(`/e/${ev.shareToken}`)
}
