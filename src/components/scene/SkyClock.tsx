import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { playChime } from '../../audio/sfx.ts'
import { useSkyHour } from '../../hooks/useSkyHour.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { setSkyHour, sky, TIMELAPSE_SECONDS, timelapseEase } from './skyTimeline.ts'

// When the target hour jumps (a preset picked in the menu), the shown hour eases over to it the short way
// round the clock, like a quick time-lapse. Damping rate: ~1.5 s for a big jump.
const EASE_RATE = 3
// Close enough to snap (hours; ~20 s of sky time).
const SNAP = 0.005

/** Shortest signed distance from a to b around a 24-hour clock. */
function hourDelta(a: number, b: number): number {
  return ((((b - a) % 24) + 36) % 24) - 12
}

/**
 * Drives the shared sky state: sets it straight to the target on load, then eases toward new targets. During a
 * clock time-lapse it runs the sky through a whole day instead. Mount before anything that reads `sky` so its frame
 * callback runs first.
 */
function SkyClock() {
  const target = useSkyHour()
  const invalidate = useThree((state) => state.invalidate)
  // Start at the target (no time-lapse on load), before the first frame reads the sky.
  useState(() => setSkyHour(target))
  // A new target needs a frame to start moving toward it.
  useEffect(() => invalidate(), [target, invalidate])

  useFrame((_, delta) => {
    const { timelapseAt, setTimelapseAt } = useAppStore.getState()
    if (timelapseAt !== null) {
      const p = (performance.now() - timelapseAt) / (TIMELAPSE_SECONDS * 1000)
      if (p < 1) {
        setSkyHour(target + 24 * timelapseEase(p))
        invalidate()
        return
      }
      setTimelapseAt(null)
      setSkyHour(target)
      if (useSettingsStore.getState().sound) playChime()
      return
    }
    const d = hourDelta(sky.hour, target)
    if (d === 0) return
    if (Math.abs(d) < SNAP) {
      setSkyHour(target)
    } else {
      setSkyHour(sky.hour + d * (1 - Math.exp(-EASE_RATE * delta)))
      // Nothing else may be requesting frames (animations off), so keep the time-lapse going.
      invalidate()
    }
  })

  return null
}

export default SkyClock
