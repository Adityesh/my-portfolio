import { createContext, useCallback, useContext } from 'react'

// Intro sequence timings, in seconds from when the scene first appears.
export const INTRO = {
  screenOnAt: 0.4,
  lightsStart: 0.8,
  lightsDuration: 1.6,
  cameraStart: 0.3,
  total: 2.8,
} as const

const smoothstep = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))

// Brightness steps for the monitor's power-on flicker, 50ms each.
const FLICKER = [1, 0.15, 0.85, 0.05, 1, 0.5, 1]
const FLICKER_STEP = 0.05

/** 0..1 multiplier for room lights. */
export function lightLevel(t: number): number {
  return smoothstep((t - INTRO.lightsStart) / INTRO.lightsDuration)
}

/** 0..1 multiplier for the monitor screen and its light. */
export function screenLevel(t: number): number {
  if (t < INTRO.screenOnAt) return 0
  return FLICKER[Math.floor((t - INTRO.screenOnAt) / FLICKER_STEP)] ?? 1
}

export type IntroClock = {
  /** performance.now() of the first rendered frame; set lazily by the first reader. */
  clock: { start: number | null }
  /** Skip the intro and animations (prefers-reduced-motion). */
  reducedMotion: boolean
}

export const IntroContext = createContext<IntroClock>({ clock: { start: null }, reducedMotion: true })

/** Returns a function giving seconds since the intro started (Infinity when motion is reduced). Call it from useFrame. */
export function useIntroTime(): () => number {
  const { clock, reducedMotion } = useContext(IntroContext)
  return useCallback(() => {
    if (reducedMotion) return Infinity
    const now = performance.now()
    clock.start ??= now
    return (now - clock.start) / 1000
  }, [clock, reducedMotion])
}

/** Whether ambient animations should run. */
export function useAnimationsEnabled(): boolean {
  return !useContext(IntroContext).reducedMotion
}
