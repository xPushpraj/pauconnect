import { useMemo, useState } from 'react'
import { AuthDialogContext, type AuthDialogContextValue, type AuthIntent } from './authDialog'

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [intent, setIntent] = useState<AuthIntent>({ type: 'none' })

  const value = useMemo<AuthDialogContextValue>(() => {
    return {
      open,
      intent,
      openDialog: (nextIntent) => {
        setIntent(nextIntent ?? { type: 'none' })
        setOpen(true)
      },
      closeDialog: () => setOpen(false),
      clearIntent: () => setIntent({ type: 'none' }),
    }
  }, [intent, open])

  return <AuthDialogContext.Provider value={value}>{children}</AuthDialogContext.Provider>
}
