import { useMemo, useState } from 'react'
import { BATCHES, COLLEGES, UNIVERSITY, USER_CATEGORIES } from '../../data/profiles'
import { useAuth } from '../../contexts/authContext'
import { supabase } from '../../lib/supabaseClient'
import type { CollegeName, ProfileRowPrivate, UserCategory } from '../../lib/types'

type Mode = 'create' | 'edit'

type ProfileFormProps = {
  mode: Mode
  initial?: Partial<ProfileRowPrivate>
  onSaved?: () => void
}

function isEmail(v: string) {
  const s = v.trim()
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function normalizeUrl(v: string) {
  const s = v.trim()
  if (!s) return null
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  return `https://${s}`
}

function normalizeEmailLink(v: string) {
  const s = v.trim()
  if (!s) return null
  if (s.toLowerCase().startsWith('mailto:')) return s
  if (isEmail(s)) return `mailto:${s}`
  return null
}

function initialEmailValue(v: string | null | undefined) {
  const s = (v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase().startsWith('mailto:')) return s.slice(7)
  if (isEmail(s)) return s
  return ''
}

function formatProfileSaveError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  const lower = msg.toLowerCase()

  if (lower.includes('row-level security') || lower.includes('rls') || lower.includes('permission denied')) {
    return 'Profile save is blocked by Supabase Row Level Security (RLS). Add an INSERT/UPDATE policy for `profiles` where `id = auth.uid()`.'
  }

  if (lower.includes('bucket') && lower.includes('not found')) {
    return 'Supabase Storage bucket `avatars` was not found. Create a public bucket named `avatars` (or disable avatar upload).'
  }

  if (lower.includes('jwt expired') || lower.includes('invalid jwt')) {
    return 'Your session expired. Please sign in again and try saving.'
  }

  return msg
}

export function ProfileForm({ mode, initial, onSaved }: ProfileFormProps) {
  const auth = useAuth()
  const userId = auth.user?.id

  const [fullName, setFullName] = useState(initial?.full_name ?? '')
  const [college, setCollege] = useState<CollegeName>((initial?.college as CollegeName) ?? 'College of Agriculture Engineering')
  const [otherCollegeName, setOtherCollegeName] = useState(initial?.other_college_name ?? '')
  const [userCategory, setUserCategory] = useState<UserCategory>((initial?.user_category as UserCategory) ?? 'Alumni')
  const [batch, setBatch] = useState(initial?.batch ?? '25th Batch (2025)')
  const [designation, setDesignation] = useState(initial?.designation ?? '')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [phoneNo, setPhoneNo] = useState(initial?.phone_no ?? '')
  const [contactEmail, setContactEmail] = useState(() => initialEmailValue(initial?.whatsapp_link))
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedin_url ?? '')
  const [instagramUrl, setInstagramUrl] = useState(initial?.instagram_url ?? '')
  const [guidanceNeeded, setGuidanceNeeded] = useState(Boolean(initial?.guidance_needed))
  const [guidanceTopic, setGuidanceTopic] = useState(initial?.guidance_topic ?? '')
  const [resumeDriveLink, setResumeDriveLink] = useState(initial?.resume_path ?? '')
  const [admissionMode, setAdmissionMode] = useState<'ICAR' | 'CET'>((initial as { admission_mode?: 'ICAR' | 'CET' | null })?.admission_mode ?? 'ICAR')

  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const avatarLimits = useMemo(() => {
    return { minBytes: 50 * 1024, maxBytes: 200 * 1024 }
  }, [])

  const canSubmit = useMemo(() => {
    if (!userId) return false
    if (!fullName.trim()) return false
    if (!phoneNo.trim()) return false
    if (college === 'Other' && !otherCollegeName.trim()) return false
    if (guidanceNeeded && !guidanceTopic.trim()) return false
    return true
  }, [college, fullName, guidanceNeeded, guidanceTopic, otherCollegeName, phoneNo, userId])

  if (!userId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
        Please sign in first.
      </div>
    )
  }

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!canSubmit) {
          const valid = e.currentTarget.reportValidity()
          if (valid) setError('Please fill all required fields.')
          return
        }

        setError(null)
        setSaving(true)

        try {
          let profilePhotoPath = initial?.profile_photo_path ?? null
          const resumePath = normalizeUrl(resumeDriveLink)

          if (avatarFile) {
            if (avatarFile.size < avatarLimits.minBytes || avatarFile.size > avatarLimits.maxBytes) {
              throw new Error('Profile photo must be between 50KB and 200KB.')
            }
            const path = `${userId}/${Date.now()}-${avatarFile.name}`
            const upload = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
            if (upload.error) throw upload.error
            profilePhotoPath = upload.data.path
          }

          const payload = {
            id: userId,
            full_name: fullName.trim(),
            university: UNIVERSITY,
            college,
            other_college_name: college === 'Other' ? otherCollegeName.trim() : null,
            user_category: userCategory,
            batch,
            designation: designation.trim() || null,
            bio: bio.trim() || null,
            phone_no: phoneNo.trim(),
            whatsapp_link: normalizeEmailLink(contactEmail),
            linkedin_url: normalizeUrl(linkedinUrl),
            instagram_url: normalizeUrl(instagramUrl),
            resume_path: resumePath,
            guidance_needed: guidanceNeeded,
            guidance_topic: guidanceNeeded ? guidanceTopic.trim() : null,
            profile_photo_path: profilePhotoPath,
            admission_mode: admissionMode,
          }

          const firstAttempt = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
          if (firstAttempt.error) {
            const msg = firstAttempt.error.message.toLowerCase()
            if (msg.includes('admission_mode')) {
              const retryPayload = { ...payload }
              delete (retryPayload as { admission_mode?: unknown }).admission_mode
              const secondAttempt = await supabase.from('profiles').upsert(retryPayload, { onConflict: 'id' })
              if (secondAttempt.error) throw secondAttempt.error
            } else {
              throw firstAttempt.error
            }
          }

          const verify = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
          if (verify.error) throw verify.error
          if (!verify.data) throw new Error('Profile was not saved. Please try again.')

          await auth.refreshProfile()
          onSaved?.()
        } catch (err) {
          setError(formatProfileSaveError(err))
        } finally {
          setSaving(false)
        }
      }}
    >
      {mode === 'create' ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
          University is set to <span className="font-semibold">{UNIVERSITY}</span>.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 sm:col-span-2">
          <span className="text-sm font-medium">Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            placeholder="Full name"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">College</span>
          <select
            value={college}
            onChange={(e) => setCollege(e.target.value as CollegeName)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
          >
            {COLLEGES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">User category</span>
          <select
            value={userCategory}
            onChange={(e) => setUserCategory(e.target.value as UserCategory)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
          >
            {USER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {college === 'Other' ? (
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium">Other college name</span>
            <input
              value={otherCollegeName}
              onChange={(e) => setOtherCollegeName(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
              placeholder="Enter your college name"
              required
            />
          </label>
        ) : null}

        <label className="grid gap-1">
          <span className="text-sm font-medium">Batch</span>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
          >
            {BATCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Designation</span>
          <input
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            placeholder="SDE / Student / Bank Manager..."
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
          placeholder="Write about yourself..."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Phone number</span>
          <input
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            placeholder="+91..."
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            type="email"
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">LinkedIn</span>
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            placeholder="linkedin.com/in/..."
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Instagram</span>
          <input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            placeholder="instagram.com/..."
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Profile photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.item(0) ?? null
              if (!file) {
                setAvatarFile(null)
                return
              }
              if (file.size < avatarLimits.minBytes || file.size > avatarLimits.maxBytes) {
                setError('Profile photo must be between 50KB and 200KB.')
                setAvatarFile(null)
                e.currentTarget.value = ''
                return
              }
              setError(null)
              setAvatarFile(file)
            }}
            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:file:bg-white dark:file:text-slate-950"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">Allowed size: 50KB–200KB.</span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Resume link (Google Drive)</span>
          <input
            value={resumeDriveLink}
            onChange={(e) => setResumeDriveLink(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            placeholder="https://drive.google.com/..."
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Selection in PAU</span>
        <select
          value={admissionMode}
          onChange={(e) => setAdmissionMode(e.target.value as 'ICAR' | 'CET')}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
        >
          <option value="ICAR">ICAR exam</option>
          <option value="CET">CET</option>
        </select>
      </label>

      <div className="grid gap-4">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
          <span>Guidance needed</span>
          <input
            type="checkbox"
            checked={guidanceNeeded}
            onChange={(e) => setGuidanceNeeded(e.target.checked)}
            className="h-5 w-5 accent-slate-900 dark:accent-white"
          />
        </label>

        {guidanceNeeded ? (
          <label className="grid gap-1">
            <span className="text-sm font-medium">Guidance topic</span>
            <input
              value={guidanceTopic}
              onChange={(e) => setGuidanceTopic(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
              placeholder="What exactly do you need help with?"
              required
            />
          </label>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!canSubmit || saving}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        {saving ? 'Saving...' : mode === 'create' ? 'Create profile' : 'Save changes'}
      </button>
    </form>
  )
}
