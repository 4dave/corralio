"use server"

import { auth } from "@/auth"
import { db } from "@/db/client"
import { events } from "@/db/schema"
import { nano } from "@/lib/ids"
import { redirect } from "next/navigation"
import { z } from "zod"

const EventInput = z.object({
  title: z.string().min(2, "Title is required"),
  description: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length ? v : null)),
  startsAt: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Start date/time is required"),
  endsAt: z
    .string()
    .optional()
    .refine(
      (s) => !s || !Number.isNaN(Date.parse(s)),
      "End date/time is invalid"
    ),
  locationText: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length ? v : null)),
  visibility: z.enum(["unlisted", "private", "public"]).default("unlisted"),
})

export type EventInputType = z.infer<typeof EventInput>

export async function createEventAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = EventInput.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: (formData.get("endsAt") as string) || undefined,
    locationText: String(formData.get("locationText") ?? ""),
    visibility:
      (formData.get("visibility") as EventInputType["visibility"]) ??
      "unlisted",
  })

  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("\n")
    // In a next pass we can return structured state for inline errors.
    throw new Error(msg)
  }

  const input = parsed.data
  const row = {
    ownerId: session.user.id,
    title: input.title,
    description: input.description,
    startsAt: new Date(input.startsAt),
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
    locationText: input.locationText,
    visibility: input.visibility,
    shareToken: nano(),
  } as const

  // Mock mode: no DB configured → still redirect w/ token so flow is testable
  if (!db) {
    redirect(`/e/${row.shareToken}`)
  }

  const [inserted] = await db
    .insert(events)
    .values(row)
    .returning({ shareToken: events.shareToken })

  redirect(`/e/${inserted.shareToken}`)
}
