import type { ReactNode } from 'react'
import { useAppStore, type FocusView } from '../../store/useAppStore.ts'

// Below this on-page size the surface is too small to read on (portrait phones: the monitor is ~365 x 205 px, the
// whiteboard ~360 x 260 px), so once the camera arrives the window fills the screen instead.
const COMPACT_WIDTH_PX = 480
const COMPACT_HEIGHT_PX = 300

type FocusWindowProps = {
  /** The view this window belongs to (it opens once the camera has arrived there). */
  view: FocusView
  id: string
  labelledBy: string
  /** Inset from the surface's edges (a fraction of its width, with a floor in CSS px), so it sits inside the frame. */
  inset: { fraction: number; minPx: number }
  /** Called with whether it's open (e.g. to move focus to the Back button). */
  children: (open: boolean) => ReactNode
}

/**
 * A DOM window laid exactly over a surface in the room (monitor screen, whiteboard): scene/FocusRect publishes the
 * surface's on-page rectangle once the camera faces it. On small screens it fills the page instead. Always in the DOM
 * (for SEO); inert and invisible until the camera has arrived.
 */
function FocusWindow({ view, id, labelledBy, inset, children }: FocusWindowProps) {
  const open = useAppStore((state) => state.view === view && !state.transitioning)
  // The last measured rectangle (kept after closing, so the window fades out where it was).
  const at = useAppStore((state) => state.focusRect)
  const compact = at !== null && (at.width < COMPACT_WIDTH_PX || at.height < COMPACT_HEIGHT_PX)
  const gap = at ? Math.max(inset.minPx, at.width * inset.fraction) : 0
  const placed = at !== null && !compact

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      inert={!open}
      // Visibility switches on at once when opening (a transitioning `visibility` is still hidden on the first frame,
      // which made the Back button's auto-focus fail) and only transitions when closing, so the window fades out.
      className={`fixed z-10 flex origin-center duration-250 ease-out motion-reduce:transition-none ${
        placed ? '' : compact ? 'inset-2' : 'inset-0'
      } ${
        open && at
          ? 'visible scale-100 opacity-100 transition-[opacity,scale]'
          : 'invisible scale-[0.94] opacity-0 transition-[opacity,scale,visibility]'
      }`}
      style={
        placed
          ? { left: at.left + gap, top: at.top + gap, width: at.width - gap * 2, height: at.height - gap * 2 }
          : undefined
      }
    >
      {children(open)}
    </section>
  )
}

export default FocusWindow
