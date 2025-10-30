type InviteRow = {
  id: string
  email: string
  status: "pending" | "accepted" | "declined"
  respondedAt: string | null // ISO string
  createdAt: string // ISO string
}

type RsvpRow = {
  id: string
  email: string | null
  userId: string | null
  response: "yes" | "no" | "maybe"
  createdAt: string // ISO
}

export default function InviteStatusTable({
  invites,
  rsvps,
}: {
  invites: InviteRow[]
  rsvps: RsvpRow[]
}) {
  const counts = {
    yes: rsvps.filter((r) => r.response === "yes").length,
    no: rsvps.filter((r) => r.response === "no").length,
    maybe: rsvps.filter((r) => r.response === "maybe").length,
    pending: invites.filter((i) => i.status === "pending").length,
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-[#151517] p-4">
        <h3 className="mb-2 text-lg font-semibold">RSVP Summary</h3>
        <div className="flex gap-4 text-sm text-zinc-300">
          <div>
            <span className="font-semibold">{counts.yes}</span> Yes
          </div>
          <div>
            <span className="font-semibold">{counts.no}</span> No
          </div>
          <div>
            <span className="font-semibold">{counts.maybe}</span> Maybe
          </div>
          <div>
            <span className="font-semibold">{counts.pending}</span> Pending
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/70 text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Invite Status</th>
              <th className="px-3 py-2 text-left">RSVP</th>
              <th className="px-3 py-2 text-left">Responded</th>
            </tr>
          </thead>
          <tbody className="bg-[#0f0f12] text-zinc-200">
            {invites.map((i) => {
              const match = rsvps.find(
                (r) =>
                  r.email && r.email.toLowerCase() === i.email.toLowerCase()
              )
              return (
                <tr key={i.id} className="border-t border-zinc-800">
                  <td className="px-3 py-2">{i.email}</td>
                  <td className="px-3 py-2 capitalize">{i.status}</td>
                  <td className="px-3 py-2 capitalize">
                    {match?.response ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {i.respondedAt
                      ? new Date(i.respondedAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              )
            })}
            {invites.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={4}>
                  No invites yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
