import { NavLink, Outlet } from 'react-router-dom'
import { LogIn, LogOut, Pencil, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../contexts/authContext'
import { useAuthDialog } from '../contexts/authDialog'
import { Modal } from './Modal'
import { ProfileForm } from './profile/ProfileForm'

const DONATE_UPI_ID = '8516919394@pthdfc'
const DONATE_UPI_URL = `upi://pay?pa=${encodeURIComponent(DONATE_UPI_ID)}&pn=${encodeURIComponent('Pushpraj Patel')}&tn=${encodeURIComponent(
  'Donate for help',
)}&cu=INR`

function linkClassName({ isActive }: { isActive: boolean }) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/60',
  ].join(' ')
}

export function AppLayout() {
  const auth = useAuth()
  const authDialog = useAuthDialog()
  const [editOpen, setEditOpen] = useState(false)
  const [donateHidden, setDonateHidden] = useState(() => {
    try {
      return window.localStorage.getItem('pauconnect_donate_hidden') === '1'
    } catch {
      return false
    }
  })

  const donateWidget = useMemo(() => {
    if (donateHidden) return null
    return (
      <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-xs">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Donate for help</div>
              <div className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">UPI: {DONATE_UPI_ID}</div>
            </div>
            <button
              type="button"
              aria-label="Close donate"
              onClick={() => {
                setDonateHidden(true)
                try {
                  window.localStorage.setItem('pauconnect_donate_hidden', '1')
                } catch {
                  return
                }
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <a
            href={DONATE_UPI_URL}
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Open UPI app
          </a>
        </div>
      </div>
    )
  }, [donateHidden])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">PAU.CONNECT</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Students × Alumni mentorship</div>
            </div>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/" className={linkClassName} end>
              Community
            </NavLink>
            <NavLink to="/about" className={linkClassName}>
              About
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {auth.isAuthenticated ? (
              auth.profileLoaded && !auth.profile ? (
                <button
                  type="button"
                  onClick={() => authDialog.openDialog({ type: 'none' })}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Complete profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit profile</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => authDialog.openDialog({ type: 'none' })}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login / Signup</span>
              </button>
            )}
            {auth.isAuthenticated ? (
              <button
                type="button"
                onClick={auth.signOut}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:hidden">
          <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <NavLink to="/" className={linkClassName} end>
              Community
            </NavLink>
            <NavLink to="/about" className={linkClassName}>
              About
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <Modal
        open={editOpen}
        title="Edit your profile"
        onClose={() => setEditOpen(false)}
        maxWidthClassName="max-w-3xl"
      >
        <ProfileForm
          mode="edit"
          initial={auth.profile ?? undefined}
          onSaved={() => {
            setEditOpen(false)
          }}
        />
      </Modal>

      {donateWidget}

      <footer className="border-t border-slate-200/70 py-10 text-sm text-slate-600 dark:border-slate-800/70 dark:text-slate-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} PAU.CONNECT</div>
            <div className="text-xs">
              Gated visibility: contact details unlock after sign-in. · Powered by{' '}
              <a href="https://notely.space" target="_blank" rel="noreferrer" className="font-semibold underline-offset-4 hover:underline">
                Notely.space
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
