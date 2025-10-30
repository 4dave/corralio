"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const scrollToHow = () => {
    const el = document.getElementById("how")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-100">
      {/* Radial accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute right-[5%] -top-20 h-[700px] w-[900px] rounded-full bg-[radial-gradient(400px_280px_at_75%_10%,rgba(255,107,87,.18),transparent_60%)]" />
        <div className="absolute left-0 top-10 h-[700px] w-[900px] rounded-full bg-[radial-gradient(450px_300px_at_10%_20%,rgba(255,177,153,.10),transparent_60%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-[#0e0e11]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#" className="group inline-flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
              {/* C corral mark */}
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9.5"
                  className="stroke-zinc-800"
                  strokeWidth="3"
                />
                <path
                  d="M18 7.5a7 7 0 1 0 0 9"
                  className="stroke-[#ff6b57]"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <b className="tracking-tight">Corralio</b>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToHow}
              className="rounded-xl border border-zinc-800 px-3 py-2 font-semibold text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,.35)] transition-transform hover:-translate-y-0.5"
            >
              How it works
            </button>
            <button
              className="rounded-xl border border-transparent bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-3 py-2 font-semibold text-[#0d0d10] shadow-[0_10px_30px_rgba(0,0,0,.35)] transition hover:brightness-105"
              onClick={() => router.push("/new")}
            >
              Create an Event
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-4">
        <section className="grid grid-cols-1 items-center gap-7 py-12 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-block rounded-full border border-[#ff6b57]/30 bg-[#ff6b57]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb199]">
              Invite • Chat • RSVP
            </span>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Round up your people.
            </h1>
            <p className="mt-3 max-w-prose text-base text-zinc-400 md:text-lg">
              Corralio makes it effortless to plan, share, and chat about
              get‑togethers — all in one simple link.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="rounded-xl border border-transparent bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-4 py-2.5 font-semibold text-[#0d0d10] shadow-[0_10px_30px_rgba(0,0,0,.35)] transition hover:brightness-105"
                onClick={() => router.push("/new")}
              >
                Create an Event
              </button>
              <button
                onClick={scrollToHow}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-semibold text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,.35)] transition-transform hover:-translate-y-0.5"
              >
                See how it works
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2">
              {[
                "No apps to download",
                "Just share a link",
                "Chat on the event page",
                "Instant RSVPs",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg border border-[#ff6b57]/40 bg-[#ff6b57]/15 text-xs">
                    ✓
                  </span>
                  <div className="text-sm">{t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo card */}
          <aside
            aria-label="Product preview"
            className="relative isolate min-h-[340px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,.35)]"
          >
            <div className="absolute -top-1/3 -left-1/4 h-[480px] w-[480px] rounded-full bg-[radial-gradient(220px_160px_at_35%_30%,rgba(255,107,87,.22),transparent_60%)]" />
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffcc66]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#63d471]" />
              </div>

              <div className="mb-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4">
                <strong className="block">Park Picnic • Sat 2pm</strong>
                <p className="mt-1 text-sm text-zinc-400">
                  Harriet Island Park, St Paul • This Saturday
                </p>
              </div>

              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4">
                <div className="h-10 w-10 rounded-xl border border-zinc-800 bg-zinc-900" />
                <div>
                  <b>What are we bringing?</b>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    Add ideas in the comments →
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-2.5">
                <input
                  aria-label="Your reply"
                  placeholder="Write a comment…"
                  className="flex-1 rounded-xl border border-zinc-800 bg-[#111217] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-[rgba(255,107,87,0.35)]"
                />
                <button className="rounded-xl border border-transparent bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-3 py-2 font-semibold text-[#0d0d10] shadow-[0_10px_30px_rgba(0,0,0,.35)]">
                  Post
                </button>
              </div>
            </div>
          </aside>
        </section>

        {/* How it works */}
        <section id="how" className="py-10 md:py-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#ffb199]">
            How it works
          </div>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
            Plan, share, and go — in four simple steps
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Create",
                d: "Describe your event in seconds. Add the what, where, and when.",
              },
              {
                n: "02",
                t: "Share",
                d: "Get a unique link you can text, post, or email to friends.",
              },
              {
                n: "03",
                t: "Chat",
                d: "Keep plans and comments together on the event page.",
              },
              {
                n: "04",
                t: "Go!",
                d: "Track RSVPs at a glance and show up ready to have fun.",
              },
            ].map((s) => (
              <article
                key={s.n}
                className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-[0_10px_30px_rgba(0,0,0,.35)]"
              >
                <div className="absolute right-4 top-3 text-sm font-extrabold text-[#ffb199]/90">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-zinc-400">{s.d}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ff6b57]/40 bg-[linear-gradient(90deg,rgba(255,107,87,.15),rgba(255,177,153,.08))] p-4">
            <p className="m-0 text-zinc-100">
              <strong>Ready to corral your crew?</strong> Create your first
              event in under a minute.
            </p>
            <button
              className="rounded-xl border border-transparent bg-linear-to-b from-[#ff6b57] to-[#ff5a43] px-4 py-2.5 font-semibold text-[#0d0d10] shadow-[0_10px_30px_rgba(0,0,0,.35)]"
              onClick={() => router.push("/new")}
            >
              Create an Event
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-zinc-800/80 bg-black/20 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9.5"
                  className="stroke-zinc-800"
                  strokeWidth="3"
                />
                <path
                  d="M18 7.5a7 7 0 1 0 0 9"
                  className="stroke-[#ff6b57]"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <small>© {new Date().getFullYear()} Corralio</small>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="#"
              className="text-zinc-400 transition hover:text-zinc-100"
            >
              Get started
            </a>
            <a
              href="#"
              className="text-zinc-400 transition hover:text-zinc-100"
            >
              About
            </a>
            <a
              href="#"
              className="text-zinc-400 transition hover:text-zinc-100"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
