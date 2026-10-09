import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'
import { VIEWPOINT_DESCRIPTIONS, VIEWPOINT_LABELS, VIEWPOINTS } from '../../store/viewpoints.ts'

/** Whether a key press is meant for a form field rather than the page. */
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
}

/**
 * Bottom bar for switching between the room overview and the first-person viewpoints (the hotspots in the room
 * do the same). Left/right arrow keys cycle through them; Esc returns to the room view.
 */
function ViewpointBar() {
  const inRoom = useAppStore((state) => state.view === 'room')
  const loading = useAppStore((state) => state.loading.active)
  const viewpoint = useAppStore((state) => state.viewpoint)
  const goToViewpoint = useAppStore((state) => state.goToViewpoint)

  useEffect(() => {
    if (!inRoom || loading) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return
      const current = useAppStore.getState().viewpoint
      if (e.key === 'Escape' && current !== 'room') {
        goToViewpoint('room')
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const step = e.key === 'ArrowRight' ? 1 : -1
        const next = VIEWPOINTS[(VIEWPOINTS.indexOf(current) + step + VIEWPOINTS.length) % VIEWPOINTS.length]
        goToViewpoint(next)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [inRoom, loading, goToViewpoint])

  if (!inRoom || loading) return null

  return (
    <nav
      aria-label="Viewpoints"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-black/55 p-1 backdrop-blur">
        {VIEWPOINTS.map((id) => {
          const current = id === viewpoint
          return (
            <button
              key={id}
              type="button"
              aria-pressed={current}
              title={VIEWPOINT_DESCRIPTIONS[id]}
              aria-label={VIEWPOINT_DESCRIPTIONS[id]}
              onClick={() => goToViewpoint(id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none sm:px-3.5 sm:text-sm ${
                current ? 'bg-sky-500/90 text-white' : 'text-neutral-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {VIEWPOINT_LABELS[id]}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default ViewpointBar
