import type { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { ProfileRowPrivate } from '../lib/types'
import { AuthContext, type AuthContextValue } from './authContext'

async function fetchMyProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as ProfileRowPrivate | null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileRowPrivate | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const refreshProfile = useCallback(async () => {
    setProfile(null)
    setProfileLoaded(false)

    if (!user) {
      setProfileLoaded(true)
      return
    }

    try {
      const row = await fetchMyProfile(user.id)
      setProfile(row)
    } catch {
      setProfile(null)
    } finally {
      setProfileLoaded(true)
    }
  }, [user])

  useEffect(() => {
    let cancelled = false

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return
        setUser(data.session?.user ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    refreshProfile().catch(() => {})
  }, [refreshProfile, user])

  const value = useMemo<AuthContextValue>(() => {
    return {
      isAuthenticated: Boolean(user),
      user,
      profile,
      profileLoaded,
      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        })
        if (error) throw error
      },
      signInWithEmailOtp: async (email) => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
      },
      signUpWithPassword: async (email, password) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
      },
      signInWithPassword: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      },
      refreshProfile,
      signOut: () => {
        supabase.auth.signOut().catch(() => {})
      },
    }
  }, [profile, profileLoaded, refreshProfile, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
