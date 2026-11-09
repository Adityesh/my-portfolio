import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'

type BackButtonProps = {
  /** Take keyboard focus when it becomes active. */
  autoFocus: boolean
  /** Dark text for light surfaces (the whiteboard); light text on the monitor. */
  tone?: 'light' | 'dark'
}

const TONES = {
  light: 'text-neutral-300 hover:bg-white/10 hover:text-white focus-visible:ring-sky-400',
  dark: 'font-marker text-neutral-800 hover:bg-black/10 hover:text-black focus-visible:ring-blue-600',
}

/** Returns from the monitor or whiteboard view to the room. Esc does the same. */
function BackButton({ autoFocus, tone = 'light' }: BackButtonProps) {
  const closeView = useAppStore((state) => state.closeView)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeView()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeView])

  // Move focus here when the view opens, so keyboard users can get back out.
  useEffect(() => {
    if (autoFocus) buttonRef.current?.focus()
  }, [autoFocus])

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={closeView}
      className={`flex items-center gap-2 rounded-md px-2.5 py-1 text-sm transition focus-visible:ring-2 focus-visible:outline-none ${TONES[tone]}`}
    >
      <span aria-hidden="true">←</span>
      Back to room
      <kbd className="hidden rounded border border-current/30 px-1.5 font-mono text-[10px] opacity-70 sm:inline">Esc</kbd>
    </button>
  )
}

export default BackButton
