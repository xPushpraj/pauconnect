import { useEffect, useId } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  maxWidthClassName?: string
}

export function Modal({ open, title, children, onClose, maxWidthClassName }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 bg-slate-950/60" onClick={onClose} aria-label="Close dialog" />
      <div
        className={[
          'relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950',
          maxWidthClassName ?? 'max-w-2xl',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
          <div>
            <div id={titleId} className="text-base font-semibold">
              {title}
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  )
}

