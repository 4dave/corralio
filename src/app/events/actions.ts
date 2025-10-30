"use server"

import { auth } from "@/auth"
import { db } from "@/db/client"
import { events } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

function isAdminEmail(email: string | undefined | null): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(/[, \n]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return !!email && adminEmails.includes(email.toLowerCase())
}

export async function closeEventAction(formData: FormData) {
  if (!db) throw new Error("DB not configured")
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) throw new Error("Unauthorized")

  const id = String(formData.get("id") || "")
  await db.update(events).set({ status: "closed" }).where(eq(events.id, id))
  revalidatePath("/events")
}

export async function reopenEventAction(formData: FormData) {
  if (!db) throw new Error("DB not configured")
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) throw new Error("Unauthorized")

  const id = String(formData.get("id") || "")
  await db.update(events).set({ status: "open" }).where(eq(events.id, id))
  revalidatePath("/events")
}

export async function deleteEventAction(formData: FormData) {
  if (!db) throw new Error("DB not configured")
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) throw new Error("Unauthorized")

  const id = String(formData.get("id") || "")
  await db.delete(events).where(eq(events.id, id))
  revalidatePath("/events")
}
