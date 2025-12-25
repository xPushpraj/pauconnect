import { LogIn, Mail, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../../contexts/authContext'
import { useAuthDialog } from '../../contexts/authDialog'
import { Modal } from '../Modal'
import { ProfileForm } from '../profile/ProfileForm'

function formatAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  if (msg.toLowerCase().includes('provider is not enabled')) {
    return 'Google login is not enabled in Supabase. Enable Google provider in Authentication → Providers.'
  }
  if (msg.toLowerCase().includes('invalid login credentials')) {
    return 'Invalid email or password.'
  }
  if (msg.toLowerCase().includes('email not confirmed')) {
    return 'Email not confirmed. Check your inbox, or disable email confirmation in Supabase for testing.'
  }
  return msg
}

export function AuthDialog() {
  const auth = useAuth()
  const dialog = useAuthDialog()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsProfile = auth.isAuthenticated && auth.profileLoaded && !auth.profile

  const title = needsProfile ? 'Complete your profile' : 'Login / Signup'

  const body = useMemo(() => {
    if (needsProfile) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
            Your account is created. Finish the profile form to join the community wall.
          </div>
          <ProfileForm
            mode="create"
            onSaved={() => {
              dialog.closeDialog()
            }}
          />
        </div>
      )
    }

    if (auth.isAuthenticated) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
            You are signed in. You can now view full profiles.
          </div>
          <button
            type="button"
            onClick={() => dialog.closeDialog()}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Continue
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-950 dark:to-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Gated visibility</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Browse publicly. Sign in to unlock bios and contact details.
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={async () => {
            setError(null)
            setPending(true)
            try {
              await auth.signInWithGoogle()
            } catch (e) {
              setError(formatAuthError(e))
            } finally {
              setPending(false)
            }
          }}
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <LogIn className="h-4 w-4" />
          Continue with Google
        </button>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={[
                'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors',
                mode === 'login'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/60',
              ].join(' ')}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={[
                'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors',
                mode === 'signup'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/60',
              ].join(' ')}
            >
              Sign up
            </button>
          </div>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>

          <button
            type="button"
            onClick={async () => {
              const v = email.trim()
              if (!v || !password) return
              setError(null)
              setPending(true)
              try {
                if (mode === 'signup') await auth.signUpWithPassword(v, password)
                else await auth.signInWithPassword(v, password)
              } catch (e) {
                setError(formatAuthError(e))
              } finally {
                setPending(false)
              }
            }}
            disabled={pending || !email.trim() || !password}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {mode === 'signup' ? 'Create account' : 'Login'}
          </button>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">or</div>

          <button
            type="button"
            onClick={async () => {
              const v = email.trim()
              if (!v) return
              setError(null)
              setPending(true)
              try {
                await auth.signInWithEmailOtp(v)
                setSent(true)
              } catch (e) {
                setError(formatAuthError(e))
              } finally {
                setPending(false)
              }
            }}
            disabled={pending || !email.trim()}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
          >
            Send login link
          </button>

          {sent ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
              Login link sent. Open your email and come back here after signing in.
            </div>
          ) : null}
        </div>
      </div>
    )
  }, [auth, dialog, email, error, mode, needsProfile, password, pending, sent])

  return (
    <Modal
      open={dialog.open}
      title={title}
      onClose={() => {
        setError(null)
        setPending(false)
        setSent(false)
        setPassword('')
        dialog.closeDialog()
      }}
      maxWidthClassName="max-w-3xl"
    >
      {body}
    </Modal>
  )
}
