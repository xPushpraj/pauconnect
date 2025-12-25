import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { ProfileRowPrivate } from '../lib/types'

export type AuthContextValue = {
  isAuthenticated: boolean
  user: User | null
  profile: ProfileRowPrivate | null
  profileLoaded: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmailOtp: (email: string) => Promise<void>
  signUpWithPassword: (email: string, password: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  refreshProfile: () => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
