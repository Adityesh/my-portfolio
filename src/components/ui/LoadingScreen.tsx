import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion.ts'
import { useAppStore } from '../../store/useAppStore.ts'

// While loading, the overlay goes from solid (0%) to translucent and blurred (100%).
const MIN_OPACITY = 0.55
const MAX_BLUR_PX = 18
// Once the scene is ready the blur clears and the overlay fades out, like a focus pull.
const REVEAL_MS = 800

type Phase = 'loading' | 'revealing' | 'gone'

/** Full-screen loading overlay: solid at 0%, blurrier as assets load, then focuses away to reveal the room. */
function LoadingScreen() {
  const { active, progress } = useAppStore((state) => state.loading)
  const reducedMotion = useReducedMotion()
  const [revealing, setRevealing] = useState(false)
  const [gone, setGone] = useState(false)

  // Start the reveal on the frame after loading ends, so the browser animates from the "loading" styles.
  useEffect(() => {
    if (active) return
    const frame = requestAnimationFrame(() => setRevealing(true))
    const timer = window.setTimeout(() => setGone(true), REVEAL_MS + 50)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [active])

  const phase: Phase = gone ? 'gone' : revealing ? 'revealing' : 'loading'
  if (phase === 'gone') return null

  const p = Math.min(1, Math.max(0, progress / 100))
  const opacity = phase === 'revealing' ? 0 : 1 - (1 - MIN_OPACITY) * p
  const blur = reducedMotion ? 0 : phase === 'revealing' ? 0 : MAX_BLUR_PX * p

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={phase === 'loading'}
      className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 motion-safe:transition-[background-color,backdrop-filter] motion-reduce:transition-[background-color]"
      style={{
        backgroundColor: `rgba(11, 11, 16, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        transitionDuration: phase === 'revealing' ? `${REVEAL_MS}ms` : '300ms',
        transitionTimingFunction: 'ease-out',
      }}
    >
      <div
        className="flex flex-col items-center gap-3 transition-opacity"
        style={{ opacity: phase === 'revealing' ? 0 : 1, transitionDuration: `${REVEAL_MS / 2}ms` }}
      >
        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-sky-400 transition-[width] duration-300 ease-out" style={{ width: `${p * 100}%` }} />
        </div>
        <span className="font-mono text-xs tracking-wide text-neutral-400">
          {phase === 'revealing' ? 'Ready' : `Loading ${Math.round(progress)}%`}
        </span>
      </div>
    </div>
  )
}

export default LoadingScreen
