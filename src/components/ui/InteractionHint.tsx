import { useEffect, useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useInteractives } from '../../store/interactives.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'

// Shown once, a moment after the room appears, then remembered.
const SHOW_AFTER_MS = 3500
const AUTO_HIDE_MS = 11000
const MIN_VISIBLE_MS = 2500

/** First-visit nudge that the room's objects do things (most visitors would never think to click a lava lamp). */
function InteractionHint() {
  const isMobile = useIsMobile()
  const seen = useSettingsStore((state) => state.seenHint)
  const setSeen = useSettingsStore((state) => state.setSeenHint)
  const ready = useAppStore((state) => state.sceneReady && !state.loading.active && state.view === 'room')
  const [shown, setShown] = useState(false)

  // Appear a little after the intro.
  useEffect(() => {
    if (seen || !ready) return
    const id = window.setTimeout(() => setShown(true), SHOW_AFTER_MS)
    return () => window.clearTimeout(id)
  }, [seen, ready])

  // Go away on its own after a while, or once the visitor finds something by pointing at it (but only after it's
  // been up long enough to read, so a pointer that happens to rest on an object doesn't make it vanish at once).
  useEffect(() => {
    if (!shown) return
    const shownAt = performance.now()
    const id = window.setTimeout(setSeen, AUTO_HIDE_MS)
    const stop = useInteractives.subscribe((state) => {
      if ((state.hovered || state.focused) && performance.now() - shownAt > MIN_VISIBLE_MS) setSeen()
    })
    return () => {
      window.clearTimeout(id)
      stop()
    }
  }, [shown, setSeen])

  if (seen || !shown || !ready) return null

  return (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 z-30 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 motion-safe:animate-[fade-in_300ms_ease-out]"
    >
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0f1729]/90 px-4 py-3 text-sm text-neutral-200 shadow-2xl shadow-black/50 backdrop-blur">
        <p className="flex-1">
          <span className="font-medium text-white">Psst…</span> most things in this room do something.{' '}
          {isMobile
            ? 'Tap the cat, the lamps, the PC… or see them all in the menu at the top left.'
            : 'Point at things to see what they do, or open the menu at the top left.'}
        </p>
        <button
          type="button"
          onClick={setSeen}
          aria-label="Dismiss hint"
          className="-mt-0.5 -mr-1 rounded-md px-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default InteractionHint
