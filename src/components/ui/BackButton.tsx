import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'

/** Returns from the monitor view. Shown once the camera has arrived; Esc works too. */
function BackButton() {
  const visible = useAppStore((state) => state.view === 'monitor' && !state.transitioning)
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
    if (visible) buttonRef.current?.focus()
  }, [visible])

  if (!visible) return null

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={closeMonitor}
      className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-sm text-neutral-100 backdrop-blur transition hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
    >
      <span aria-hidden="true">←</span>
      Back to room
      <kbd className="ml-1 hidden rounded border border-white/20 px-1.5 text-xs text-neutral-400 sm:inline">Esc</kbd>
    </button>
  )
}

export default BackButton
