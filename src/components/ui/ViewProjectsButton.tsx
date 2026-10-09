import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'

/**
 * Keyboard/screen-reader route into the monitor view (the 3D monitor itself isn't focusable).
 * Visually hidden until focused.
 */
function ViewProjectsButton() {
  const view = useAppStore((state) => state.view)
  const transitioning = useAppStore((state) => state.transitioning)
  const openMonitor = useAppStore((state) => state.openMonitor)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)

  // When coming back from the monitor via this button, put focus back on it.
  useEffect(() => {
    if (view === 'room' && !transitioning && returnFocus.current) {
      returnFocus.current = false
      buttonRef.current?.focus()
    }
  }, [view, transitioning])

  if (view !== 'room') return null

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        returnFocus.current = true
        openMonitor()
      }}
      className="sr-only absolute top-4 left-4 z-20 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:outline-none"
    >
      View projects
    </button>
  )
}

export default ViewProjectsButton
