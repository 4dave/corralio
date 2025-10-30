"use server"

import { db } from "@/db/client"
import { eventInvites, events } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function respondInviteAction(formData: FormData) {
  if (!db) throw new Error("Database not configured")

  const token = String(formData.get("inviteToken") ?? "")
  const decision = String(formData.get("decision") ?? "") // "accepted" | "declined"

  const [inv] = await db
    .select()
    .from(eventInvites)
    .where(eq(eventInvites.inviteToken, token))
    .limit(1)
  if (!inv) throw new Error("Invite not found")

  await db
    .update(eventInvites)
    .set({
      status: decision === "accepted" ? "accepted" : "declined",
      respondedAt: new Date(),
    })
    .where(eq(eventInvites.id, inv.id))

  // simple gate: cookie to allow viewing private event
  const cookieStore = await cookies()
  cookieStore.set(`invite_access_${inv.eventId}`, "true", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  const [ev] = await db
    .select()
    .from(events)
    .where(eq(events.id, inv.eventId))
    .limit(1)
  if (!ev) throw new Error("Event missing")
  redirect(`/e/${ev.shareToken}`)
}
