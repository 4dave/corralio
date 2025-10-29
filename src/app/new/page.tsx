import { auth } from "@/auth"
import SubmitButton from "@/components/SubmitButton"
import { createEventAction } from "./actions"
import Link from "next/link"

export default async function NewEventPage() {
  const session = await auth()

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d0d10] flex flex-col items-center justify-center text-zinc-100">
        <div className="bg-[#151517] p-8 rounded-2xl shadow-xl max-w-sm text-center space-y-4">
          <div className="text-lg font-semibold">
            Please sign in to create an event.
          </div>
          <a
            href="/api/auth/signin?callbackUrl=%2Fnew"
            className="inline-block rounded-xl border border-zinc-700 bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-5 py-2.5 font-semibold text-[#0d0d10] shadow-md hover:brightness-110 transition"
          >
            Sign in
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d10] text-zinc-100">
      <div className="mx-auto max-w-xl p-6">
        <h1 className="mb-6 text-3xl font-bold text-center bg-linear-to-r from-[#ff6b57] to-[#ff5a43] bg-clip-text text-transparent">
          Create a New Event
        </h1>

        <form
          action={createEventAction}
          className="space-y-5 bg-[#151517] p-6 rounded-2xl shadow-lg border border-zinc-800"
        >
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Title</label>
            <input
              name="title"
              required
              placeholder="Park Picnic"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 placeholder:text-zinc-500 focus:border-[#ff6b57] focus:ring-0"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Snacks and frisbee at the park"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 placeholder:text-zinc-500 focus:border-[#ff6b57] focus:ring-0"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Starts</label>
              <input
                type="datetime-local"
                name="startsAt"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 focus:border-[#ff6b57] focus:ring-0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Ends (optional)
              </label>
              <input
                type="datetime-local"
                name="endsAt"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 focus:border-[#ff6b57] focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-400">Location</label>
            <input
              name="locationText"
              placeholder="Harriet Island Park, St Paul"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 placeholder:text-zinc-500 focus:border-[#ff6b57] focus:ring-0"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Visibility
            </label>
            <select
              name="visibility"
              defaultValue="unlisted"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900/70 p-2 text-zinc-100 focus:border-[#ff6b57] focus:ring-0"
            >
              <option value="unlisted">Unlisted (shareable link)</option>
              <option value="private">Private (invites only)</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <Link
              href="/"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-semibold text-zinc-100"
            >
              Cancel
            </Link>
            <SubmitButton>Create Event</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
