import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { useSkyHour } from '../../hooks/useSkyHour.ts'
import { setSkyHour, sky } from './skyTimeline.ts'

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
 * Drives the shared sky state: sets it straight to the target on load, then eases toward new targets.
 * Mount before anything that reads `sky` so its frame callback runs first.
 */
function SkyClock() {
  const target = useSkyHour()
  const invalidate = useThree((state) => state.invalidate)
  // Start at the target (no time-lapse on load), before the first frame reads the sky.
  useState(() => setSkyHour(target))
  // A new target needs a frame to start moving toward it.
  useEffect(() => invalidate(), [target, invalidate])

  useFrame((_, delta) => {
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
