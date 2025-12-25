import { createContext, useContext } from 'react'

export type AuthIntent = { type: 'view_profile'; profileId: string } | { type: 'none' }

export type AuthDialogContextValue = {
  open: boolean
  intent: AuthIntent
  openDialog: (intent?: AuthIntent) => void
  closeDialog: () => void
  clearIntent: () => void
}

export const AuthDialogContext = createContext<AuthDialogContextValue | null>(null)

export function useAuthDialog() {
  const ctx = useContext(AuthDialogContext)
  if (!ctx) throw new Error('useAuthDialog must be used within AuthDialogProvider')
  return ctx
}
