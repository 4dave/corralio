import { auth } from "@/auth"
import { db } from "@/db/client"
import { comments, events } from "@/db/schema"
import { nanoid } from "nanoid" // for mock id only
import { eq } from "drizzle-orm"

type MemoryComment = {
  id: string
  eventId: string
  userId: string | null
  body: string
  createdAt: Date
}

type MemoryEvent = {
  id: string
  shareToken: string
}

const memory = { comments: [] as MemoryComment[], events: [] as MemoryEvent[] }

export async function POST(req: Request) {
  const session = await auth()
  const body = await req.json()
  const { shareToken, text } = body as { shareToken: string; text: string }
  if (!text?.trim()) return Response.json({ error: "Empty" }, { status: 400 })

  if (!db) {
    const ev = memory.events.find((e) => e.shareToken === shareToken)
    if (!ev) return Response.json({ error: "Event not found" }, { status: 404 })
    const c = {
      id: nanoid(),
      eventId: ev.id,
      userId: session?.user?.id ?? null,
      body: text,
      createdAt: new Date(),
    }
    memory.comments.push(c)
    return Response.json(c)
  }

  const [ev] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.shareToken, shareToken))
    .limit(1)
  if (!ev) return Response.json({ error: "Event not found" }, { status: 404 })

  const [c] = await db
    .insert(comments)
    .values({ eventId: ev.id, userId: session?.user?.id ?? null, body: text })
    .returning()
  return Response.json(c)
}
