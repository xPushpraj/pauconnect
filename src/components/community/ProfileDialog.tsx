import { FileText, Instagram, Linkedin, MessageCircle, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/authContext'
import { useAuthDialog } from '../../contexts/authDialog'
import { supabase } from '../../lib/supabaseClient'
import type { ProfileRowPrivate, ProfileRowPublic } from '../../lib/types'
import { Modal } from '../Modal'

type ProfileDialogProps = {
  open: boolean
  profile: ProfileRowPublic | null
  onClose: () => void
}

function collegeLabel(profile: ProfileRowPublic) {
  if (profile.college !== 'Other') return profile.college ?? '—'
  if (profile.other_college_name?.trim()) return profile.other_college_name
  return 'Other'
}

export function ProfileDialog({ open, profile, onClose }: ProfileDialogProps) {
  const auth = useAuth()
  const authDialog = useAuthDialog()
  const [privateProfile, setPrivateProfile] = useState<ProfileRowPrivate | null>(null)
  const [loading, setLoading] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  const title = profile ? profile.full_name : 'Profile'

  const canShowPrivate = auth.isAuthenticated && Boolean(profile)

  useEffect(() => {
    let cancelled = false
    if (!open || !profile || !auth.isAuthenticated) return

    void (async () => {
      await Promise.resolve()
      if (cancelled) return
      setPrivateProfile(null)
      setResumeUrl(null)
      setLoading(true)

      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', profile.id).maybeSingle()
        if (cancelled) return
        if (error) throw error

        const row = data as ProfileRowPrivate | null
        setPrivateProfile(row)

        const path = row?.resume_path
        if (!path) return

        if (path.startsWith('http://') || path.startsWith('https://')) {
          setResumeUrl(path)
          return
        }

        const signed = await supabase.storage.from('resumes').createSignedUrl(path, 60 * 10)
        if (cancelled) return
        if (signed.data?.signedUrl) setResumeUrl(signed.data.signedUrl)
      } catch {
        if (cancelled) return
        setPrivateProfile(null)
        setResumeUrl(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [auth.isAuthenticated, open, profile])

  const gatedBody = useMemo(() => {
    if (!profile) return null
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-950 dark:to-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Join PAU.CONNECT to unlock</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Bio, guidance topic, WhatsApp, LinkedIn and resume links are visible only after sign-in.
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose()
            authDialog.openDialog({ type: 'view_profile', profileId: profile.id })
          }}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Login / Signup
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          Public info preview: <span className="font-medium text-slate-900 dark:text-slate-50">{collegeLabel(profile)}</span> ·{' '}
          <span className="font-medium text-slate-900 dark:text-slate-50">{profile.batch ?? '—'}</span>
        </div>
      </div>
    )
  }, [authDialog, onClose, profile])

  const privateBody = useMemo(() => {
    if (!profile) return null
    if (!privateProfile) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
          {loading ? 'Loading private details...' : 'Private details are not available.'}
        </div>
      )
    }

    const row = privateProfile
    return (
      <div className="space-y-6">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="text-xs text-slate-500 dark:text-slate-400">About</div>
          <div className="text-sm leading-6 text-slate-700 dark:text-slate-200">{row.bio ?? '—'}</div>
        </div>

        {row.guidance_needed ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/30 dark:bg-orange-500/10">
            <div className="text-xs font-semibold text-orange-800 dark:text-orange-200">Guidance Topic</div>
            <div className="mt-1 text-sm text-orange-900 dark:text-orange-100">{row.guidance_topic ?? 'Guidance needed'}</div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-4">
          <a
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
            href={row.whatsapp_link || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!row.whatsapp_link}
            onClick={(e) => {
              if (!row.whatsapp_link) e.preventDefault()
            }}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
            href={resumeUrl || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!resumeUrl}
            onClick={(e) => {
              if (!resumeUrl) e.preventDefault()
            }}
          >
            <FileText className="h-4 w-4" />
            Resume
          </a>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
            href={row.linkedin_url || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!row.linkedin_url}
            onClick={(e) => {
              if (!row.linkedin_url) e.preventDefault()
            }}
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
            href={row.instagram_url || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!row.instagram_url}
            onClick={(e) => {
              if (!row.instagram_url) e.preventDefault()
            }}
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
        </div>

      </div>
    )
  }, [loading, privateProfile, profile, resumeUrl])

  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        onClose()
      }}
      maxWidthClassName="max-w-3xl"
    >
      {canShowPrivate ? privateBody : gatedBody}
    </Modal>
  )
}
