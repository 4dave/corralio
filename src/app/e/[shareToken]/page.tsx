import { db } from "@/db/client"
import {
  events,
  comments as commentsTable,
  eventInvites,
  rsvps,
} from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { unstable_noStore as noStore } from "next/cache"
import CommentsSection from "@/components/CommentsSection"
import { addCommentAction } from "./actions"
import { auth } from "@/auth"
import { cookies } from "next/headers"
import InviteForm from "./invite/InviteForm"
import { addInvitesAction } from "./invite/actions"
import InviteStatusTable from "@/components/InviteStatusTable"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EventPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  noStore()
  const { shareToken } = await params
  const session = await auth()

  if (!db) {
    // (mock mode) — unchanged...
    return /* ... */
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.shareToken, shareToken))
    .limit(1)
  if (!event) return <div className="p-6">Event not found.</div>

  // PRIVATE gate
  if (event.visibility === "private") {
    const cookieStore = await cookies()
    const cookieGate =
      cookieStore.get(`invite_access_${event.id}`)?.value === "true"
    const isOwner = session?.user?.id === event.ownerId
    if (!cookieGate && !isOwner) {
      return (
        <div className="mx-auto max-w-2xl space-y-4 p-6 text-zinc-100 bg-[#0d0d10] min-h-screen">
          <h1 className="text-2xl font-bold">Private Event</h1>
          <p className="text-zinc-300">
            This event is private. You need an invite to view it.
          </p>
          <p className="text-zinc-400">
            Check your email for an invitation link.
          </p>
        </div>
      )
    }
  }

  // COMMENTS (existing)
  const rows = await db
    .select({
      id: commentsTable.id,
      body: commentsTable.body,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .where(eq(commentsTable.eventId, event.id))
    .orderBy(desc(commentsTable.createdAt))

  const initialComments = rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt!.toISOString(),
  }))

  // 👇 NEW: fetch invites + RSVPs if owner (to render status table)
  const isOwner = session?.user?.id === event.ownerId

  let invites: Array<{
    id: string
    email: string
    status: "pending" | "accepted" | "declined"
    respondedAt: string | null
    createdAt: string
  }> = []

  let rsvpRows: Array<{
    id: string
    email: string | null
    userId: string | null
    response: "yes" | "no" | "maybe"
    createdAt: string
  }> = []

  if (isOwner) {
    const invRows = await db
      .select({
        id: eventInvites.id,
        email: eventInvites.email,
        status: eventInvites.status,
        respondedAt: eventInvites.respondedAt,
        createdAt: eventInvites.createdAt,
      })
      .from(eventInvites)
      .where(eq(eventInvites.eventId, event.id))
      .orderBy(desc(eventInvites.createdAt))

    invites = invRows.map((i) => ({
      id: i.id,
      email: i.email,
      status: i.status,
      respondedAt: i.respondedAt ? i.respondedAt.toISOString() : null,
      createdAt: i.createdAt!.toISOString(),
    }))

    const rRows = await db
      .select({
        id: rsvps.id,
        email: rsvps.email,
        userId: rsvps.userId,
        response: rsvps.response,
        createdAt: rsvps.createdAt,
      })
      .from(rsvps)
      .where(eq(rsvps.eventId, event.id))
      .orderBy(desc(rsvps.createdAt))

    rsvpRows = rRows.map((r) => ({
      id: r.id,
      email: r.email,
      userId: r.userId,
      response: r.response,
      createdAt: r.createdAt!.toISOString(),
    }))
  }

  if (event.status === "closed") {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6 text-zinc-100 bg-[#0d0d10] min-h-screen">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-zinc-400 italic">This event is closed.</p>
        <div className="text-zinc-300">
          {event.locationText ?? "Location TBA"}
        </div>
        <div className="text-zinc-400">
          {new Date(event.startsAt).toLocaleString()}
          {event.endsAt ? ` – ${new Date(event.endsAt).toLocaleString()}` : ""}
        </div>
        {event.description ? (
          <p className="mt-1 text-zinc-200">{event.description}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6 text-zinc-100 bg-[#0d0d10] min-h-screen">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      {event.locationText ? (
        <div className="text-zinc-300">{event.locationText}</div>
      ) : null}
      <div className="text-zinc-400">
        {new Date(event.startsAt).toLocaleString()}
        {event.endsAt ? ` – ${new Date(event.endsAt).toLocaleString()}` : ""}
      </div>
      {event.description ? (
        <p className="mt-1 text-zinc-200">{event.description}</p>
      ) : null}

      {/* Comments (same as before) */}
      <CommentsSection
        initial={initialComments}
        shareToken={shareToken}
        onSubmit={addCommentAction}
        canPost={!!session}
      />

      {/* Owner-only: Invite guests form + status table */}
      {isOwner && (
        <>
          <div className="pt-6">
            <h2 className="mb-2 text-lg font-semibold">Invite Guests</h2>
            <InviteForm shareToken={shareToken} onSubmit={addInvitesAction} />
          </div>

          <div className="pt-4">
            <h2 className="mb-2 text-lg font-semibold">Invite Status</h2>
            <InviteStatusTable invites={invites} rsvps={rsvpRows} />
          </div>
        </>
      )}
    </div>
  )
}
