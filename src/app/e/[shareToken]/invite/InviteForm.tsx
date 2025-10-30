"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl border border-transparent bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-3 py-2 font-semibold text-[#0d0d10] shadow disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send Invites"}
    </button>
  )
}

export default function InviteForm({
  shareToken,
  onSubmit,
}: {
  shareToken: string
  onSubmit: (fd: FormData) => Promise<{ ok: boolean }>
}) {
  const [emails, setEmails] = React.useState("")
  const [msg, setMsg] = React.useState<string | null>(null)
  const [err, setErr] = React.useState<string | null>(null)

  return (
    <form
      action={async (fd) => {
        setMsg(null)
        setErr(null)
        fd.set("shareToken", shareToken)
        try {
          const res = await onSubmit(fd)
          if (!res?.ok) throw new Error("Failed to send invites")
          setEmails("")
          setMsg("Invites sent")
        } catch (e) {
          const message =
            e instanceof Error ? e.message : "Something went wrong"
          setErr(message)
        }
      }}
      className="space-y-3 rounded-2xl border border-zinc-800 bg-[#151517] p-4"
    >
      <div>
        <label className="mb-1 block text-sm text-zinc-400">
          Invite by email
        </label>
        <textarea
          name="emails"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder={"alice@example.com, bob@example.com\ncarol@example.com"}
          className="w-full min-h-20 rounded-xl border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 placeholder:text-zinc-500 focus:border-[#ff6b57] focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Comma, space or new-line separated.
        </p>
        <SubmitBtn />
      </div>
      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
    </form>
  )
}
