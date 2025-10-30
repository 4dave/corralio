// src/app/e/[shareToken]/page.tsx
import { db } from "@/db/client"
import { events, comments as commentsTable } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { unstable_noStore as noStore } from "next/cache"
import CommentsSection from "@/components/CommentsSection"
import { addCommentAction } from "./actions"
import { auth } from "@/auth"
import Link from "next/link"
import { cookies } from "next/headers"
import InviteForm from "./invite/InviteForm"
import { addInvitesAction } from "./invite/actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

// ⬇️ Moved OUTSIDE render (no closure)
function AuthBanner({
  email,
  shareToken,
}: {
  email?: string | null
  shareToken: string
}) {
  return (
    <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300">
      {email ? (
        <div>
          <Link
            className="underline hover:text-[#ffb199]"
            href="/api/auth/signout?callbackUrl=/"
          >
            Sign out
          </Link>
        </div>
      ) : (
        <div>
          You’re not signed in.{" "}
          <Link
            className="underline hover:text-[#ffb199]"
            href={`/api/auth/signin?callbackUrl=${encodeURIComponent(
              `/e/${shareToken}`
            )}`}
          >
            Sign in
          </Link>{" "}
          to post comments.
        </div>
      )}
    </div>
  )
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  noStore()
  const { shareToken } = await params
  const session = await auth()
  const email = session?.user?.email ?? null

  // Mock mode
  if (!db) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6 text-zinc-100 bg-[#0d0d10] min-h-screen">
        <h1 className="text-2xl font-bold">Event</h1>
        <p className="text-zinc-300">
          No database configured. You were redirected to /e/{shareToken}.
        </p>
        <AuthBanner email={email} shareToken={shareToken} />
        <CommentsSection
          initial={[]}
          shareToken={shareToken}
          onSubmit={addCommentAction}
          canPost={!!session}
        />
      </div>
    )
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.shareToken, shareToken))
    .limit(1)
  if (!event) return <div className="p-6">Event not found.</div>

  // Private visibility gate
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
  const rows = await db
    .select({
      id: commentsTable.id,
      body: commentsTable.body,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .where(eq(commentsTable.eventId, event.id))
    .orderBy(desc(commentsTable.createdAt))

  const initial = rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt!.toISOString(),
  }))

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

      <AuthBanner email={email} shareToken={shareToken} />

      {session?.user?.id === event.ownerId && (
        <div className="pt-6">
          <h2 className="mb-2 text-lg font-semibold">Invite Guests</h2>
          <InviteForm shareToken={shareToken} onSubmit={addInvitesAction} />
        </div>
      )}

      <CommentsSection
        initial={initial}
        shareToken={shareToken}
        onSubmit={addCommentAction}
        canPost={!!session}
      />
    </div>
  )
}
