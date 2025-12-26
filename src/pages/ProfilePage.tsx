import { ArrowLeft, FileText, Instagram, Linkedin, MessageCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { useAuthDialog } from '../contexts/authDialog'
import { supabase } from '../lib/supabaseClient'
import type { ProfileRowPrivate, ProfileRowPublic } from '../lib/types'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const chars = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean)
  return chars.join('')
}

function collegeLabel(profile: ProfileRowPublic) {
  if (profile.college !== 'Other') return profile.college ?? '—'
  if (profile.other_college_name?.trim()) return profile.other_college_name
  return 'Other'
}

function selectionLabel(v?: string | null) {
  if (v === 'ICAR') return 'ICAR exam'
  if (v === 'CET') return 'CET'
  return '—'
}

export function ProfilePage() {
  const auth = useAuth()
  const authDialog = useAuthDialog()
  const navigate = useNavigate()
  const params = useParams()
  const profileId = params.id

  const [publicProfile, setPublicProfile] = useState<ProfileRowPublic | null>(null)
  const [privateProfile, setPrivateProfile] = useState<ProfileRowPrivate | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!profileId) {
      setPublicProfile(null)
      setPrivateProfile(null)
      setResumeUrl(null)
      setLoading(false)
      setError('Missing profile id')
      return
    }

    void (async () => {
      setLoading(true)
      setError(null)
      setPublicProfile(null)
      setPrivateProfile(null)
      setResumeUrl(null)

      try {
        if (!auth.isAuthenticated) {
          const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('id,full_name,college,other_college_name,user_category,batch,designation,guidance_needed,profile_photo_path,created_at,updated_at')
            .eq('id', profileId)
            .maybeSingle()

          if (cancelled) return
          if (fetchError) throw fetchError

          setPublicProfile((data as ProfileRowPublic | null) ?? null)
          return
        }

        const { data, error: fetchError } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle()
        if (cancelled) return
        if (fetchError) throw fetchError

        const row = (data as ProfileRowPrivate | null) ?? null
        setPrivateProfile(row)
        setPublicProfile(row)

        const path = row?.resume_path
        if (!path) return

        if (path.startsWith('http://') || path.startsWith('https://')) {
          setResumeUrl(path)
          return
        }

        const signed = await supabase.storage.from('resumes').createSignedUrl(path, 60 * 10)
        if (cancelled) return
        if (signed.data?.signedUrl) setResumeUrl(signed.data.signedUrl)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [auth.isAuthenticated, profileId])

  const avatarUrl = useMemo(() => {
    const path = publicProfile?.profile_photo_path
    if (!path) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl || null
  }, [publicProfile?.profile_photo_path])

  const title = publicProfile?.full_name?.trim() || 'Profile'
  const showPrivate = auth.isAuthenticated && Boolean(privateProfile)

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 sm:p-10">
        Loading profile...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-900 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100 sm:p-10">
        {error}
      </div>
    )
  }

  if (!publicProfile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 sm:p-10">
        Profile not found.
      </div>
    )
  }

  const p = publicProfile
  const row = privateProfile

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="text-xs text-slate-500 dark:text-slate-400">Phone number is never shown to other users.</div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="relative p-6 sm:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-500/25 to-sky-500/25 blur-3xl dark:from-emerald-500/20 dark:to-sky-500/20" />
          <div className="relative grid gap-6 lg:grid-cols-5 lg:items-center">
            <div className="flex items-center gap-4 lg:col-span-2">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-slate-900 text-xl font-semibold text-white dark:bg-white dark:text-slate-950 sm:h-24 sm:w-24">
                {avatarUrl ? <img alt="" src={avatarUrl} className="h-full w-full object-cover" /> : initials(p.full_name)}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">{title}</h1>
                <div className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{p.designation ?? '—'}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {p.guidance_needed ? (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
                      Guidance Needed
                    </span>
                  ) : null}
                  {p.user_category ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                      {p.user_category}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              {!auth.isAuthenticated ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-950 dark:to-slate-950">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Sign in to unlock full details</div>
                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          Bio, guidance topic, and social links are visible only after sign-in.
                        </div>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => authDialog.openDialog({ type: 'view_profile', profileId: p.id })}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    Login / Signup
                  </button>

                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">College</div>
                      <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{collegeLabel(p)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Batch</div>
                      <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{p.batch ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Category</div>
                      <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{p.user_category ?? '—'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="text-xs text-slate-500 dark:text-slate-400">College</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{collegeLabel(p)}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Batch</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{p.batch ?? '—'}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="text-xs text-slate-500 dark:text-slate-400">User category</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{p.user_category ?? '—'}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Selection in PAU</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">
                      {selectionLabel((p as { admission_mode?: string | null }).admission_mode)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showPrivate && row ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="space-y-4 lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Bio</div>
              <div className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{row.bio ?? '—'}</div>
            </div>

            {row.guidance_needed ? (
              <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm dark:border-orange-500/30 dark:bg-orange-500/10">
                <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">Guidance Topic</div>
                <div className="mt-2 text-sm text-orange-900 dark:text-orange-100">{row.guidance_topic ?? 'Guidance needed'}</div>
              </div>
            ) : null}
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Connect</div>
              <div className="mt-4 grid gap-3">
                <a
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
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
                <a
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
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
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

