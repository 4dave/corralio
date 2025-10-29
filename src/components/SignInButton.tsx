// src/components/SignInButton.tsx
"use client"
import { useRouter } from "next/navigation"

export default function SignInButton({
  callback = "/new",
}: {
  callback?: string
}) {
  const router = useRouter()
  return (
    <button
      onClick={() =>
        router.push(
          `/api/auth/signin?callbackUrl=${encodeURIComponent(callback)}`
        )
      }
      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-semibold text-zinc-100 hover:-translate-y-0.5 transition"
    >
      Sign in
    </button>
  )
}
