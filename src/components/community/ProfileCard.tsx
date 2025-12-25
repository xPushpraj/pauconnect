import { Briefcase, GraduationCap } from 'lucide-react'
import { memo } from 'react'
import type { ProfileRowPublic } from '../../lib/types'

type ProfileCardProps = {
  profile: ProfileRowPublic
  avatarUrl?: string
  onView: () => void
}

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

function ProfileCardImpl({ profile, avatarUrl, onView }: ProfileCardProps) {
  const showAlumni = profile.user_category === 'Alumni'
  const showGuidance = Boolean(profile.guidance_needed)

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-transparent dark:from-emerald-500/15 dark:via-sky-500/10" />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              {avatarUrl ? (
                <img alt="" src={avatarUrl} className="h-full w-full object-cover" />
              ) : (
                initials(profile.full_name)
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">{profile.full_name}</div>
              <div className="truncate text-sm text-slate-600 dark:text-slate-300">{profile.designation ?? '—'}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {showGuidance ? (
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
                Guidance Needed
              </span>
            ) : null}
            {showAlumni ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                Alumni
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{collegeLabel(profile)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{profile.batch ?? '—'}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">Punjab Agricultural University</div>
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export const ProfileCard = memo(ProfileCardImpl)

