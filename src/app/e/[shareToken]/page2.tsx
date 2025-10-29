import { db } from "@/db/client"
import { events } from "@/db/schema"
import { eq } from "drizzle-orm"
import { unstable_noStore as noStore } from "next/cache"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EventPage({
  params,
}: {
  // 👇 In Next 16, params may be a Promise
  params: Promise<{ shareToken: string }>
}) {
  noStore()

  const { shareToken } = await params // ✅ unwrap the Promise
  const token = shareToken

  if (!db) {
    return (
      <div className="p-6 space-y-2">
        <h1 className="text-2xl font-bold">Event</h1>
        <p>No database configured. You were redirected to /e/{token}.</p>
      </div>
    )
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.shareToken, token))
    .limit(1)

  if (!event) return <div className="p-6">Event not found.</div>

  return (
    <div className="mx-auto max-w-2xl space-y-2 p-6">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      {event.locationText ? (
        <div className="text-zinc-300">{event.locationText}</div>
      ) : null}
      <div className="text-zinc-400">
        {new Date(event.startsAt).toLocaleString()}
        {event.endsAt ? ` – ${new Date(event.endsAt).toLocaleString()}` : ""}
      </div>
      {event.description ? (
        <p className="mt-3 text-zinc-200">{event.description}</p>
      ) : null}
    </div>
  )
}
