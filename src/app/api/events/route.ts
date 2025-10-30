import { auth } from "@/auth"
import { db } from "@/db/client"
import { events } from "@/db/schema"
import { nano } from "@/lib/ids"
import { eq, desc } from "drizzle-orm"

// simple in-memory mock if DB not configured
interface MemoryEvent {
  id: string
  ownerId: string
  title: string
  description: string | null
  startsAt: Date
  endsAt: Date | null
  locationText: string | null
  visibility: string
  shareToken: string
  createdAt: Date
  updatedAt: Date
}

const memory = { events: [] as MemoryEvent[] }

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const row = {
    ownerId: session.user.id,
    title: body.title,
    description: body.description ?? null,
    startsAt: new Date(body.startsAt),
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
    locationText: body.locationText ?? null,
    visibility: body.visibility ?? "unlisted",
    shareToken: nano(),
  }

  if (!db) {
    const id = crypto.randomUUID()
    const now = new Date()
    memory.events.push({ id, ...row, createdAt: now, updatedAt: now })
    return Response.json({ shareToken: row.shareToken })
  }

  const [inserted] = await db
    .insert(events)
    .values(row)
    .returning({ shareToken: events.shareToken })
  return Response.json(inserted)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json([], { status: 200 })

  if (!db) {
    const mine = memory.events.filter((e) => e.ownerId === session.user!.id)
    return Response.json(mine)
  }

  const rows = await db
    .select()
    .from(events)
    .where(eq(events.ownerId, session.user.id))
    .orderBy(desc(events.createdAt))
  return Response.json(rows)
}
