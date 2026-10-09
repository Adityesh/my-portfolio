import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/useAppStore.ts'
import {
  initialQuality,
  QUALITY_LABELS,
  QUALITY_LEVELS,
  stepDown,
  stepUp,
  type QualityLevel,
  type QualitySetting,
} from '../../store/quality.ts'
import { useSettingsStore, type FrameRateSetting } from '../../store/useSettingsStore.ts'
import { INTRO, useIntroTime } from './introTimeline.ts'

const HIGH_FPS = 60
const LOW_FPS = 30
// Measure in windows of this length...
const WINDOW_MS = 2500
// ...ignoring this long after any change (switching lights/shadows recompiles shaders, which hitches).
const SETTLE_MS = 1500
// Step down after this many windows in a row below DECLINE_RATIO of the cap.
const DECLINE_RATIO = 0.85
const BAD_WINDOWS = 2
// Try stepping up after this many windows in a row at STABLE_RATIO of the cap (~10 s).
const STABLE_RATIO = 0.95
const STABLE_WINDOWS = 4
// A step up that struggles within this many windows is reverted, and stepping up stops for the visit.
const TRIAL_WINDOWS = 2
// Safety net, even for a level the visitor picked: this slow for this many windows means the device is choking
// (frames taking seconds); switch to Low until they choose a level again.
const UNUSABLE_FPS = 6
const UNUSABLE_WINDOWS = 2
const SAFE_LEVEL: QualityLevel = 'low'
// Small tolerance so a 60 Hz display doesn't skip frames that arrive a hair early.
const PACING_SLACK_MS = 2

type Trial = { kind: 'quality'; from: QualityLevel } | { kind: 'fps' }

type PerformanceGovernorProps = {
  /** Ambient animation running (frames are requested continuously); otherwise rendering is on demand. */
  animate: boolean
  frameRate: FrameRateSetting
  quality: QualitySetting
  isMobile: boolean
}

/**
 * Paces animation frames (requestAnimationFrame, capped at 30 or 60) and adapts the frame cap and rendering
 * quality to what the device sustains. Auto drops 60 → 30 first, then lowers quality one level at a time;
 * after ~10 s of headroom it tries a step up and reverts (and stops trying) if that struggles.
 * The level Auto settles on is remembered for this device. Without animation there's nothing to measure,
 * so the starting level is kept.
 */
function PerformanceGovernor({ animate, frameRate, quality, isMobile }: PerformanceGovernorProps) {
  const invalidate = useThree((state) => state.invalidate)
  const getTime = useIntroTime()
  const setFrameCap = useAppStore((state) => state.setFrameCap)
  const setQuality = useAppStore((state) => state.setQuality)
  const setLearnedQuality = useSettingsStore((state) => state.setLearnedQuality)

  const autoQuality = quality === 'auto'
  const autoFps = frameRate === 'auto'
  // The remembered level is read once, when the scene starts.
  const [autoLevel, setAutoLevel] = useState<QualityLevel>(() =>
    initialQuality('auto', useSettingsStore.getState().learnedQuality, isMobile),
  )
  const [autoCap, setAutoCap] = useState(HIGH_FPS)
  const [note, setNote] = useState('')
  // Set when the safety net overrides a level the visitor picked (the menu clears it when they pick again).
  const override = useAppStore((state) => state.qualityOverride)
  const setOverride = useAppStore((state) => state.setQualityOverride)
  // Auto handles slowness itself; the override only replaces a level the visitor picked.
  const level = autoQuality ? autoLevel : (override ?? quality)
  const cap = autoFps ? autoCap : frameRate

  const state = useRef({
    start: 0,
    frames: 0,
    bad: 0,
    stable: 0,
    unusable: 0,
    lastChange: 0,
    trial: null as Trial | null,
    trialWindows: 0,
    qualityUpLocked: false,
    fpsUpLocked: false,
  })

  // Publish the current state for the scene, the canvas and the debug overlay.
  useEffect(() => {
    setQuality({ level, auto: autoQuality, note, overridden: !autoQuality && override !== null })
  }, [level, autoQuality, note, override, setQuality])
  useEffect(() => {
    setFrameCap(animate ? { fps: cap, auto: autoFps } : null)
  }, [animate, cap, autoFps, setFrameCap])
  useEffect(() => () => {
    setQuality(null)
    setFrameCap(null)
  }, [setQuality, setFrameCap])

  // Remember what Auto settles on, so this device starts there next visit. Levels being trialled
  // aren't saved until they hold up (see the trial handling below).
  useEffect(() => {
    if (autoQuality && state.current.trial?.kind !== 'quality') setLearnedQuality(autoLevel)
  }, [autoQuality, autoLevel, setLearnedQuality])

  // Request a frame each display refresh, but no more often than the cap.
  useEffect(() => {
    if (!animate) return
    const interval = 1000 / cap
    let last = 0
    let id = requestAnimationFrame(function tick(now) {
      if (now - last >= interval - PACING_SLACK_MS) {
        last = now
        invalidate()
      }
      id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [animate, cap, invalidate])


  // A hidden tab renders nothing; restart the window when visibility changes so the gap isn't counted as slow.
  useEffect(() => {
    const restart = () => {
      state.current.start = 0
      state.current.frames = 0
    }
    document.addEventListener('visibilitychange', restart)
    return () => document.removeEventListener('visibilitychange', restart)
  }, [])

  // Manual choices reset the automatic history.
  useEffect(() => {
    state.current.trial = null
    state.current.bad = 0
    state.current.stable = 0
    state.current.unusable = 0
  }, [quality, frameRate, override])

  useFrame(() => {
    if (!animate || getTime() < INTRO.total) return
    const s = state.current
    const now = performance.now()
    if (s.start === 0 || document.hidden) {
      s.start = now
      s.frames = 0
      return
    }
    s.frames += 1
    const elapsed = now - s.start
    if (elapsed < WINDOW_MS) return

    const achieved = (s.frames * 1000) / elapsed
    const ratio = achieved / cap
    s.start = now
    s.frames = 0
    if (now - s.lastChange < SETTLE_MS) return

    // Safety net: applies whatever the settings, if the device is choking above the safe level.
    s.unusable = achieved < UNUSABLE_FPS ? s.unusable + 1 : 0
    if (s.unusable >= UNUSABLE_WINDOWS && QUALITY_LEVELS.indexOf(level) > QUALITY_LEVELS.indexOf(SAFE_LEVEL)) {
      s.unusable = 0
      s.lastChange = now
      s.trial = null
      if (autoQuality) {
        setAutoLevel(SAFE_LEVEL)
      } else {
        setOverride(SAFE_LEVEL)
      }
      setNote(`${QUALITY_LABELS[level]} too heavy, using ${QUALITY_LABELS[SAFE_LEVEL]} at ${Math.round(getTime())}s`)
      return
    }
    if (!autoQuality && !autoFps) return

    const change = (text: string) => {
      s.lastChange = now
      s.bad = 0
      s.stable = 0
      setNote(`${text} at ${Math.round(getTime())}s`)
    }

    if (ratio < DECLINE_RATIO) {
      s.bad += 1
      s.stable = 0
    } else {
      s.bad = 0
      s.stable = ratio >= STABLE_RATIO ? s.stable + 1 : 0
    }

    // A recent step up is struggling: undo it and stop trying to step up this way.
    if (s.trial && s.bad >= 1) {
      if (s.trial.kind === 'quality') {
        setAutoLevel(s.trial.from)
        s.qualityUpLocked = true
        change(`back to ${QUALITY_LABELS[s.trial.from]}`)
      } else {
        setAutoCap(LOW_FPS)
        s.fpsUpLocked = true
        change('back to 30 fps')
      }
      s.trial = null
      return
    }
    if (s.trial && ++s.trialWindows >= TRIAL_WINDOWS) {
      // The step up held: it's now the level to remember.
      if (s.trial.kind === 'quality' && autoQuality) setLearnedQuality(level)
      s.trial = null
    }

    if (s.bad >= BAD_WINDOWS) {
      if (autoFps && cap === HIGH_FPS) {
        setAutoCap(LOW_FPS)
        change('60 → 30 fps')
      } else if (autoQuality && level !== 'minimal') {
        const next = stepDown(level)
        setAutoLevel(next)
        change(`down to ${QUALITY_LABELS[next]}`)
      }
      return
    }

    if (s.stable >= STABLE_WINDOWS && !s.trial) {
      if (autoQuality && level !== 'high' && !s.qualityUpLocked) {
        const next = stepUp(level)
        s.trial = { kind: 'quality', from: level }
        s.trialWindows = 0
        setAutoLevel(next)
        change(`trying ${QUALITY_LABELS[next]}`)
      } else if (autoFps && cap === LOW_FPS && !s.fpsUpLocked && (level === 'high' || !autoQuality)) {
        s.trial = { kind: 'fps' }
        s.trialWindows = 0
        setAutoCap(HIGH_FPS)
        change('trying 60 fps')
      }
    }
  })

  return null
}

export default PerformanceGovernor
