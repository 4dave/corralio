import { db } from "@/db/client"
import { users, events } from "@/db/schema"
import { nano } from "@/lib/ids"

async function main() {
  if (!db) {
    console.log("No DB configured; skipping seed.")
    return
  }
  const uid = "seed-user-1"
  await db
    .insert(users)
    .values({ id: uid, email: "demo@example.com", name: "Demo" })
    .onConflictDoNothing()
  await db.insert(events).values({
    ownerId: uid,
    title: "Park Picnic",
    description: "Snacks and frisbee",
    startsAt: new Date(Date.now() + 86400000),
    locationText: "Harriet Island Park, St Paul",
    shareToken: nano(),
  })
  console.log("Seeded.")
}
main()
