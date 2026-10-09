import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'

type BackButtonProps = {
  /** Take keyboard focus when it becomes active. */
  autoFocus: boolean
}

/** Returns from the monitor view to the room. Esc does the same. */
function BackButton({ autoFocus }: BackButtonProps) {
  const closeMonitor = useAppStore((state) => state.closeMonitor)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMonitor()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeMonitor])

  // Move focus here when the monitor view opens, so keyboard users can get back out.
  useEffect(() => {
    if (autoFocus) buttonRef.current?.focus()
  }, [autoFocus])

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={closeMonitor}
      className="flex items-center gap-2 rounded-md px-2.5 py-1 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
    >
      <span aria-hidden="true">←</span>
      Back to room
      <kbd className="hidden rounded border border-white/20 px-1.5 font-mono text-[10px] text-neutral-400 sm:inline">Esc</kbd>
    </button>
  )
}

export default BackButton
