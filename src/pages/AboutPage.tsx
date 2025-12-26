import { ExternalLink, Mail, ShieldCheck, User } from 'lucide-react'

const DONATE_UPI_ID = '8516919394@pthdfc'
const DONATE_UPI_URL = `upi://pay?pa=${encodeURIComponent(DONATE_UPI_ID)}&pn=${encodeURIComponent('Pushpraj Patel')}&tn=${encodeURIComponent(
  'Donate for help',
)}&cu=INR`

export function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="relative p-6 sm:p-10">
          <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-500/25 to-sky-500/25 blur-3xl dark:from-emerald-500/20 dark:to-sky-500/20" />
          <div className="relative grid gap-6 lg:grid-cols-5 lg:items-center">
            <div className="space-y-3 lg:col-span-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4" />
                Trust, safety, and clear ownership
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">About PAU.CONNECT</h1>
              <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
                PAU.CONNECT is a dedicated ecosystem for Punjab Agricultural University that makes mentorship accessible through a gated visibility model.
                You can browse profiles publicly, while sensitive contact details remain protected until members sign in.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">About Me</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Pushpraj Patel · Agritech Enthusiast</div>
                    <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      <p>
                        I am Pushpraj Patel, an Agritech Enthusiast currently pursuing B.Tech in Agriculture from Punjab Agricultural University,
                        Ludhiana. My academic background in agriculture, combined with a strong interest in technology, drives my focus on building
                        data-driven and digital solutions for modern farming challenges.
                      </p>
                      <p>
                        I maintain an active presence on GitHub, where I document my learning journey and practical projects, and I continuously work on
                        improving my skills through real-world implementations rather than purely theoretical learning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
            <div className="lg:col-span-2">
              <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                <img
                  src="/assets/Pushpz_profile (1).jpg"
                  alt="Pushpraj Patel"
                  loading="lazy"
                  className="h-64 w-full object-cover object-top sm:h-80"
                />
              </div>
            </div>
            <div className="space-y-5 lg:col-span-3">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Key Links</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    href="https://pushpz.netlify.app"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Portfolio
                  </a>
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                    href="https://github.com/xpushpraj"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                    href="https://www.linkedin.com/in/xpushpz"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                    href="mailto:pushpz072@gmail.com"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Donate for help</div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  UPI ID: <span className="font-semibold">{DONATE_UPI_ID}</span>
                </div>
                <a
                  href={DONATE_UPI_URL}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Open UPI app
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold">Gated visibility</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Public discovery remains easy, while private details are protected behind authentication.
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold">Simple, modern UI</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Clean cards, clear filters, and smooth interactions on mobile, tablet, and desktop.
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="text-sm font-semibold">Mentorship-first</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Highlight “Guidance Needed” and a guidance topic so requests are specific and actionable.
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="p-6 sm:p-10">
          <div className="text-sm font-semibold">Powered by Notely.space</div>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Notely.space is a free-notes platform for college students. This website is powered by Notely to support learning and mentorship together.
          </p>
          <a
            href="https://notely.space"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <ExternalLink className="h-4 w-4" />
            Visit Notely.space
          </a>
        </div>
      </section>
    </div>
  )
}
