"use client"

import { deleteEventAction } from "./actions"

export function DeleteEventButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  return (
    <form
      action={async (formData: FormData) => {
        if (!confirm(`Delete event "${title}"? This cannot be undone.`)) {
          return
        }
        await deleteEventAction(formData)
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="rounded-md border border-red-800 bg-red-900/40 px-2 py-1 text-red-200 hover:bg-red-900/60">
        Delete
      </button>
    </form>
  )
}
