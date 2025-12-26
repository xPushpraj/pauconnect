import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Filter, Search, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BATCHES, COLLEGES } from '../../data/profiles'
import type { ProfileRowPublic } from '../../lib/types'
import { supabase } from '../../lib/supabaseClient'
import { ProfileCard } from './ProfileCard'

type FilterState = {
  search: string
  college: string
  batch: string
  showGuidanceOnly: boolean
  showAlumniOnly: boolean
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

function isAlumni(profile: ProfileRowPublic) {
  return profile.user_category === 'Alumni'
}

function getCollegeLabel(profile: ProfileRowPublic) {
  if (profile.college !== 'Other') return profile.college ?? '—'
  return profile.other_college_name?.trim() ? profile.other_college_name : 'Other'
}

export function CommunitySection() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<ProfileRowPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    college: 'All',
    batch: 'All',
    showGuidanceOnly: false,
    showAlumniOnly: false,
  })

  const deferredSearch = useDeferredValue(filters.search)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(
            'id,full_name,college,other_college_name,user_category,batch,designation,guidance_needed,profile_photo_path,created_at,updated_at',
          )
          .order('created_at', { ascending: false })

        if (cancelled) return
        if (error) {
          setLoadError(error.message)
          setProfiles([])
          return
        }

        setProfiles((data as ProfileRowPublic[]).filter((p) => Boolean(p.full_name?.trim())))
      } catch (e) {
        if (cancelled) return
        setLoadError(e instanceof Error ? e.message : 'Failed to load profiles')
        setProfiles([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredProfiles = useMemo(() => {
    const q = normalize(deferredSearch)

    const base = profiles.filter((p) => {
      if (filters.showGuidanceOnly && !p.guidance_needed) return false
      if (filters.showAlumniOnly && !isAlumni(p)) return false

      if (filters.college !== 'All') {
        const label = getCollegeLabel(p)
        if (label !== filters.college) return false
      }

      if (filters.batch !== 'All' && p.batch !== filters.batch) return false

      if (!q) return true
      const haystack = [p.full_name, p.designation ?? '', getCollegeLabel(p), p.batch ?? '', p.user_category ?? '']
        .map(normalize)
        .join(' ')
      return haystack.includes(q)
    })

    return base.sort((a, b) => {
      if (Boolean(a.guidance_needed) !== Boolean(b.guidance_needed)) return a.guidance_needed ? -1 : 1
      if (isAlumni(a) !== isAlumni(b)) return isAlumni(a) ? -1 : 1
      return a.full_name.localeCompare(b.full_name)
    })
  }, [deferredSearch, filters.batch, filters.college, filters.showAlumniOnly, filters.showGuidanceOnly, profiles])

  const collegeOptions = useMemo(() => {
    const otherNames = profiles
      .filter((p) => p.college === 'Other')
      .map((p) => p.other_college_name?.trim())
      .filter((n): n is string => Boolean(n))
    const derived = Array.from(new Set(otherNames)).sort((a, b) => a.localeCompare(b))
    return ['All', ...COLLEGES.filter((c) => c !== 'Other'), ...derived, 'Other']
  }, [profiles])

  const avatarUrlById = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of filteredProfiles) {
      const path = p.profile_photo_path
      if (!path) continue
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      if (data.publicUrl) map.set(p.id, data.publicUrl)
    }
    return map
  }, [filteredProfiles])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              <Filter className="h-4 w-4" />
              Public Wall
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Browse members by college and batch. Contact details unlock after sign-in.
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Search name, role, college, batch..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  search: '',
                  college: 'All',
                  batch: 'All',
                  showGuidanceOnly: false,
                  showAlumniOnly: false,
                })
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">College</span>
            <select
              value={filters.college}
              onChange={(e) => setFilters((f) => ({ ...f, college: e.target.value }))}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            >
              {collegeOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Batch</span>
            <select
              value={filters.batch}
              onChange={(e) => setFilters((f) => ({ ...f, batch: e.target.value }))}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600"
            >
              {['All', ...BATCHES].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
            <span>Guidance needed</span>
            <input
              type="checkbox"
              checked={filters.showGuidanceOnly}
              onChange={(e) => setFilters((f) => ({ ...f, showGuidanceOnly: e.target.checked }))}
              className="h-5 w-5 accent-slate-900 dark:accent-white"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
            <span>Alumni only</span>
            <input
              type="checkbox"
              checked={filters.showAlumniOnly}
              onChange={(e) => setFilters((f) => ({ ...f, showAlumniOnly: e.target.checked }))}
              className="h-5 w-5 accent-slate-900 dark:accent-white"
            />
          </label>
        </div>

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {loading ? (
            <span>Loading profiles...</span>
          ) : loadError ? (
            <span className="text-red-700 dark:text-red-200">{loadError}</span>
          ) : (
            <span>
              Showing <span className="font-semibold text-slate-900 dark:text-slate-50">{filteredProfiles.length}</span> profiles
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            avatarUrl={avatarUrlById.get(p.id)}
            onView={() => {
              navigate(`/profiles/${p.id}`)
            }}
          />
        ))}
      </div>
    </section>
  )
}
