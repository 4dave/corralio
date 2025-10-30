import { db } from "@/db/client"
import { events } from "@/db/schema"
import { eq } from "drizzle-orm"

type Event = {
  shareToken: string
  // add other event properties here as needed
}

const memory = { events: [] as Event[] } // shared shape if you also import from create route

import { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shareToken: string }> }
) {
  const token = (await context.params).shareToken

  if (!db) {
    const ev = memory.events.find((e) => e.shareToken === token)
    if (!ev) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(ev)
  }

  const [row] = await db
    .select()
    .from(events)
    .where(eq(events.shareToken, token))
    .limit(1)
  if (!row) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(row)
}
