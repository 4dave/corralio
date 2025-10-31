import { auth } from "@/auth"
import { db } from "@/db/client"
import { events, users } from "@/db/schema"
import { and, desc, gte, ilike, lte, eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"
import Filters from "./filters"
import { closeEventAction, reopenEventAction } from "./actions"
import { DeleteEventButton } from "./DeleteEventButton"

export const dynamic = "force-dynamic"
export const revalidate = 0

function isAdminEmail(email: string | undefined | null): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(/[, \n]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return !!email && adminEmails.includes(email.toLowerCase())
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  noStore()

  const session = await auth()
  if (!session?.user?.email) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/events")}`)
  }
  if (!isAdminEmail(session.user.email)) {
    notFound()
  }

  const sp = await searchParams
  const q = (sp.q as string) || ""
  const vis = (sp.visibility as string) || ""
  const status = (sp.status as string) || ""
  const from = (sp.from as string) || ""
  const to = (sp.to as string) || ""

  if (!db) {
    return (
      <div className="min-h-screen bg-[#0d0d10] text-zinc-100 p-6">
        <div className="mx-auto max-w-5xl">
          <Header email={session.user.email} />
          <Filters initial={{ q, vis, status, from, to }} />
          <p className="text-zinc-400">Database not configured.</p>
        </div>
      </div>
    )
  }

  // build filters
  const clauses = []
  if (q) {
    // match title or location
    clauses.push(
      ilike(events.title, `%${q}%`) // drizzle uses ilike for case-insensitive
    )
    // We want OR(title, location). Easiest is two queries OR using SQL. For simplicity:
    // We'll filter by title OR location with AND group; better: use sql`(title ilike ... or location_text ilike ...)`.
  }
  if (vis && (vis === "public" || vis === "private")) {
    clauses.push(eq(events.visibility, vis))
  }
  if (status && (status === "open" || status === "closed")) {
    clauses.push(eq(events.status, status))
  }
  if (from) clauses.push(gte(events.startsAt, new Date(from)))
  if (to) {
    const end = new Date(to)
    end.setDate(end.getDate() + 1) // include end day
    clauses.push(lte(events.startsAt, end))
  }

  const { sql } = await import("drizzle-orm")

  // NOTE: To properly OR title/location, use a raw SQL condition:
  const where =
    q && clauses.length
      ? and(
          sql`${events.title} ILIKE ${"%" + q + "%"} OR ${
            events.locationText
          } ILIKE ${"%" + q + "%"}`,
          ...clauses.slice(1) // keep others except first clause (which was the title check)
        )
      : q
      ? sql`${events.title} ILIKE ${"%" + q + "%"} OR ${
          events.locationText
        } ILIKE ${"%" + q + "%"}`
      : clauses.length
      ? and(...clauses)
      : undefined

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      visibility: events.visibility,
      status: events.status,
      locationText: events.locationText,
      shareToken: events.shareToken,
      ownerId: events.ownerId,
      ownerEmail: users.email,
    })
    .from(events)
    .leftJoin(users, eq(users.id, events.ownerId))
    .where(where)
    .orderBy(desc(events.startsAt))

  return (
    <div className="min-h-screen bg-[#0d0d10] text-zinc-100 p-6">
      <div className="mx-auto max-w-5xl">
        <Header email={session.user.email} />
        <Filters initial={{ q, vis, status, from, to }} />

        <div className="rounded-2xl border border-zinc-800 overflow-x-scroll">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/70 text-zinc-300">
              <tr>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Starts</th>
                <th className="px-3 py-2 text-left">Ends</th>
                <th className="px-3 py-2 text-left">Visibility</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Owner</th>
                <th className="px-3 py-2 text-left">Link</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#0f0f12] text-zinc-200">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-zinc-400" colSpan={8}>
                    No events found.
                  </td>
                </tr>
              ) : (
                rows.map((e) => (
                  <tr key={e.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2">{e.title}</td>
                    <td className="px-3 py-2">
                      {new Date(e.startsAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {e.endsAt ? new Date(e.endsAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2 capitalize">{e.visibility}</td>
                    <td className="px-3 py-2 capitalize">{e.status}</td>
                    <td className="px-3 py-2">
                      {e.ownerEmail ?? e.ownerId ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <a
                        href={`/e/${e.shareToken}`}
                        className="underline hover:text-[#ffb199]"
                      >
                        Open
                      </a>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {e.status === "open" ? (
                          <form action={closeEventAction}>
                            <input type="hidden" name="id" value={e.id} />
                            <button className="rounded-md border border-zinc-700 bg-zinc-900/70 px-2 py-1 hover:border-[#ff6b57]">
                              Close
                            </button>
                          </form>
                        ) : (
                          <form action={reopenEventAction}>
                            <input type="hidden" name="id" value={e.id} />
                            <button className="rounded-md border border-zinc-700 bg-zinc-900/70 px-2 py-1 hover:border-[#ff6b57]">
                              Reopen
                            </button>
                          </form>
                        )}
                        <DeleteEventButton id={e.id} title={e.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Header({ email }: { email: string }) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold">All Events (Admin)</h1>
      <div className="text-sm text-zinc-400">
        Signed in as <span className="font-semibold">{email}</span>
      </div>
    </header>
  )
}
