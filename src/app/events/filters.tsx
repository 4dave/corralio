"use client"

import * as React from "react"

export default function Filters({
  initial,
}: {
  initial: {
    q: string
    vis: string
    status: string
    from: string
    to: string
  }
}) {
  const [q, setQ] = React.useState(initial.q)
  const [vis, setVis] = React.useState(initial.vis)
  const [status, setStatus] = React.useState(initial.status)
  const [from, setFrom] = React.useState(initial.from)
  const [to, setTo] = React.useState(initial.to)

  return (
    <form method="GET" className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
      <input
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title or location"
        className="rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 placeholder:text-zinc-500"
      />
      <select
        name="visibility"
        value={vis}
        onChange={(e) => setVis(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100"
      >
        <option value="">All visibility</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="private">Private</option>
      </select>
      <select
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100"
      >
        <option value="">All status</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>
      <input
        type="date"
        name="from"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100"
      />
      <input
        type="date"
        name="to"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100"
      />
      {/* implicit submit by enter; or add a button */}
    </form>
  )
}
