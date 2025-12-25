import { ArrowRight, ShieldCheck } from 'lucide-react'
import { CommunitySection } from '../components/community/CommunitySection'

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-500/25 to-sky-500/25 blur-3xl dark:from-emerald-500/20 dark:to-sky-500/20" />
        <div className="relative grid gap-6 lg:grid-cols-5 lg:items-center">
          <div className="space-y-4 lg:col-span-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              Gated visibility for safer networking
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Find mentors. Build connections. Grow with PAU.
            </h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
              A mini community wall for Punjab Agricultural University students and alumni. Browse profiles publicly, then sign in to unlock bios and
              contact links.
            </p>
          </div>
          <div className="lg:col-span-2">
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
              <div className="font-semibold">How it works</div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium">1) Explore</div>
                  <div className="text-slate-600 dark:text-slate-300">Filter by college & batch.</div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium">2) Join</div>
                  <div className="text-slate-600 dark:text-slate-300">Sign in to unlock details.</div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium">3) Connect</div>
                  <div className="text-slate-600 dark:text-slate-300">Chat on WhatsApp, view resume.</div>
                </div>
                <div className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold">Mentorship-first</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Mark “Guidance Needed” so seniors can respond faster.</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold">Fast discovery</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Search by name, role, college, batch and filters.</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-transparent p-5 shadow-sm dark:border-slate-800 dark:from-emerald-500/10 dark:via-sky-500/10">
          <div className="text-sm font-semibold">Powered by Notely.space</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Notely provides free notes for college students and supports this platform’s learning mission.
          </div>
          <a
            href="https://notely.space"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Visit Notely.space
          </a>
        </div>
      </section>

      <CommunitySection />
    </div>
  )
}
