import { db } from "@/db/client"
import { eventInvites, events } from "@/db/schema"
import { eq } from "drizzle-orm"
import { unstable_noStore as noStore } from "next/cache"
import { respondInviteAction } from "./actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function InvitePage({
  params,
}: {
  params: Promise<{ inviteToken: string }>
}) {
  noStore()
  if (!db) return <div className="p-6">Database not configured.</div>

  const { inviteToken } = await params

  const [inv] = await db
    .select()
    .from(eventInvites)
    .where(eq(eventInvites.inviteToken, inviteToken))
    .limit(1)
  if (!inv) return <div className="p-6">Invite not found.</div>

  const [ev] = await db
    .select()
    .from(events)
    .where(eq(events.id, inv.eventId))
    .limit(1)
  if (!ev) return <div className="p-6">Event not found.</div>

  return (
    <div className="mx-auto max-w-xl space-y-4 bg-[#0d0d10] p-6 text-zinc-100 min-h-screen">
      <h1 className="text-2xl font-bold">You’re invited: {ev.title}</h1>
      <div className="text-zinc-300">{ev.locationText ?? "Location TBA"}</div>
      <div className="text-zinc-400">
        {new Date(ev.startsAt).toLocaleString()}
      </div>

      <form
        action={respondInviteAction}
        className="mt-4 flex items-center gap-3"
      >
        <input type="hidden" name="inviteToken" value={inviteToken} />
        <button
          name="decision"
          value="accepted"
          className="rounded-xl border border-transparent bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-4 py-2 font-semibold text-[#0d0d10]"
        >
          Accept
        </button>
        <button
          name="decision"
          value="maybe"
          className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-2 font-semibold text-zinc-100 hover:border-[#ff6b57]"
        >
          Maybe
        </button>

        <button
          name="decision"
          value="declined"
          className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-2 font-semibold text-zinc-100 hover:border-[#ff6b57]"
        >
          Decline
        </button>
      </form>

      {inv.status !== "pending" ? (
        <p className="text-sm text-zinc-400">
          Your current response: {inv.status}
        </p>
      ) : null}
    </div>
  )
}
