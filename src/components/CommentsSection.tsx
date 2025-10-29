"use client"
import * as React from "react"
import { useOptimistic } from "react"
import { useFormStatus } from "react-dom"

export type CommentItem = {
  id: string
  body: string
  createdAt: string
  userName?: string | null
}

export default function CommentsSection({
  initial,
  shareToken,
  onSubmit,
  canPost,
}: {
  initial: CommentItem[]
  shareToken: string
  onSubmit: (formData: FormData) => Promise<{ ok: boolean }>
  canPost: boolean
}) {
  const [text, setText] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const [optimistic, addOptimistic] = useOptimistic(
    initial,
    (state: CommentItem[], next: CommentItem) => [next, ...state]
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const value = text.trim()
    if (!value) return

    const temp: CommentItem = {
      id: `temp-${Date.now()}`,
      body: value,
      createdAt: new Date().toISOString(),
    }

    // ✅ wrap optimistic update in a transition
    React.startTransition(() => {
      addOptimistic(temp)
    })

    const fd = new FormData()
    fd.set("shareToken", shareToken)
    fd.set("text", value)

    try {
      const res = await onSubmit(fd)
      if (!res?.ok) throw new Error("Failed to post")
      setText("")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#151517] p-4">
      <h2 className="mb-3 text-lg font-semibold">Comments</h2>

      <form onSubmit={handleSubmit} className="mb-3 flex items-start gap-2">
        <input type="hidden" name="shareToken" value={shareToken} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={canPost ? "Write a comment…" : "Sign in to comment"}
          disabled={!canPost}
          className="min-h-11 flex-1 resize-y rounded-xl border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 placeholder:text-zinc-500 focus:border-[#ff6b57] focus:outline-none"
        />
        <PostButton disabled={!canPost || !text.trim()}>Post</PostButton>
      </form>

      {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}

      <ul className="space-y-3">
        {optimistic.length === 0 ? (
          <li className="text-sm text-zinc-400">Be the first to comment.</li>
        ) : (
          optimistic.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
            >
              <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                {c.body}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

function PostButton({
  disabled,
  children,
}: {
  disabled?: boolean
  children: React.ReactNode
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-xl border border-transparent bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-3 py-2 font-semibold text-[#0d0d10] shadow disabled:opacity-60"
    >
      {pending ? "Posting…" : children}
    </button>
  )
}
