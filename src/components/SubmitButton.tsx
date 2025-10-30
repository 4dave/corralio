"use client"

import { useFormStatus } from "react-dom"

export default function SubmitButton({
  children,
}: {
  children: React.ReactNode
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl border border-transparent bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-4 py-2.5 font-semibold text-[#0d0d10] shadow-[0_10px_30px_rgba(0,0,0,.35)] disabled:opacity-60"
    >
      {pending ? "Creating…" : children}
    </button>
  )
}
