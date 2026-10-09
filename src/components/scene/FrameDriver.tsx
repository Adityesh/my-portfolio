import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'
import type { FrameRateSetting } from '../../store/useSettingsStore.ts'
import { INTRO, useIntroTime } from './introTimeline.ts'

const HIGH = 60
const LOW = 30
// Auto mode: measure over windows of this length once the intro is over...
const PROBE_WINDOW_MS = 3000
// ...and fall back to 30 after this many windows in a row below this achieved rate.
const MIN_ACCEPTABLE_FPS = 50
const BAD_WINDOWS_TO_DROP = 2
// Small tolerance so a 60 Hz display doesn't skip frames that arrive a hair early.
const PACING_SLACK_MS = 2

type FrameDriverProps = {
  setting: FrameRateSetting
}

/**
 * The Canvas uses frameloop="demand"; this requests frames for ambient animation, paced to the display
 * (requestAnimationFrame) and capped at 30 or 60 fps. Auto starts at 60 and drops to 30 for the rest of the
 * visit if the device can't keep up. Browsers pause it in hidden tabs.
 */
function FrameDriver({ setting }: FrameDriverProps) {
  const invalidate = useThree((state) => state.invalidate)
  const setFrameCap = useAppStore((state) => state.setFrameCap)
  const getTime = useIntroTime()
  const [autoCap, setAutoCap] = useState(HIGH)
  const fps = setting === 'auto' ? autoCap : setting

  useEffect(() => {
    setFrameCap({ fps, auto: setting === 'auto' })
    return () => setFrameCap(null)
  }, [fps, setting, setFrameCap])

  // Request a frame each display refresh, but no more often than the cap.
  useEffect(() => {
    const interval = 1000 / fps
    let last = 0
    let id = requestAnimationFrame(function tick(now) {
      if (now - last >= interval - PACING_SLACK_MS) {
        last = now
        invalidate()
      }
      id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [fps, invalidate])

  // Auto: count frames actually rendered and step down if 60 isn't sustainable.
  const probe = useRef({ start: 0, frames: 0, bad: 0 })
  // A hidden tab renders nothing; restart the measurement when visibility changes so the gap isn't counted as slow.
  useEffect(() => {
    const restart = () => {
      probe.current.start = 0
      probe.current.frames = 0
    }
    document.addEventListener('visibilitychange', restart)
    return () => document.removeEventListener('visibilitychange', restart)
  }, [])
  useFrame(() => {
    if (setting !== 'auto' || autoCap !== HIGH || getTime() < INTRO.total) return
    const p = probe.current
    const now = performance.now()
    if (p.start === 0 || document.hidden) {
      p.start = now
      p.frames = 0
      return
    }
    p.frames += 1
    const elapsed = now - p.start
    if (elapsed < PROBE_WINDOW_MS) return
    const achieved = (p.frames * 1000) / elapsed
    p.bad = achieved < MIN_ACCEPTABLE_FPS ? p.bad + 1 : 0
    p.start = now
    p.frames = 0
    if (p.bad >= BAD_WINDOWS_TO_DROP) setAutoCap(LOW)
  })

  return null
}

export default FrameDriver
