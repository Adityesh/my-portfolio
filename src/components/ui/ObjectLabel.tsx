import { activeInteractive, useInteractives } from '../../store/interactives.ts'
import { useAppStore } from '../../store/useAppStore.ts'

/**
 * Small label above the object under the pointer (or focused in the keyboard list), saying what it is and what
 * tapping does. Positioned from the scene's projection of the object's anchor (scene/LabelAnchor).
 */
function ObjectLabel() {
  const id = useInteractives(activeInteractive)
  const entry = useInteractives((state) => (id ? state.entries[id] : undefined))
  const at = useInteractives((state) => state.labelAt)
  const visible = useAppStore((state) => state.view === 'room' && !state.transitioning && !state.cutting)
  if (!entry || !at || !visible) return null

  return (
    <div
      role="presentation"
      className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-full motion-safe:animate-[fade-in_120ms_ease-out]"
      style={{ left: at.x, top: at.y }}
    >
      <div className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs whitespace-nowrap text-neutral-200 shadow-lg shadow-black/40 backdrop-blur">
        <span className="font-medium text-white">{entry.name}</span>
        <span className="text-neutral-400"> · {entry.action}</span>
      </div>
    </div>
  )
}

export default ObjectLabel
