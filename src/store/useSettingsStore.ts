import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { QualityLevel, QualitySetting } from './quality.ts'
import type { TimeOfDaySetting } from './timeOfDay.ts'

// localStorage can throw (private mode, blocked storage); fall back to in-memory defaults.
const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Storage unavailable: the setting still applies for this visit.
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Storage unavailable: nothing to remove.
    }
  },
}

export type FrameRateSetting = 'auto' | 30 | 60

type SettingsState = {
  /** null = follow the OS reduced-motion preference. */
  animations: boolean | null
  /** Rendering quality: 'auto' adapts to the device; a level locks it. */
  quality: QualitySetting
  /** The level Auto settled on for this device last time (start there next visit). */
  learnedQuality: QualityLevel | null
  cameraDrift: boolean
  dust: boolean
  /** Sound effects (the cat). They only ever play right after the visitor touches something. */
  sound: boolean
  /** What the window shows: the real local time, or a fixed time of day. */
  timeOfDay: TimeOfDaySetting
  /** Show the FPS / renderer stats overlay. */
  debug: boolean
  /** Animation frame cap: 'auto' tries 60 and falls back to 30 if the device can't keep up. */
  frameRate: FrameRateSetting
  setAnimations: (on: boolean) => void
  setQuality: (quality: QualitySetting) => void
  setLearnedQuality: (level: QualityLevel) => void
  setCameraDrift: (on: boolean) => void
  setDust: (on: boolean) => void
  setSound: (on: boolean) => void
  setTimeOfDay: (timeOfDay: TimeOfDaySetting) => void
  setDebug: (on: boolean) => void
  setFrameRate: (rate: FrameRateSetting) => void
  reset: () => void
}

// Choices the visitor makes in the menu. (learnedQuality is device knowledge, so Reset keeps it.)
const DEFAULTS = {
  animations: null,
  quality: 'auto' as QualitySetting,
  cameraDrift: true,
  dust: true,
  sound: true,
  timeOfDay: 'live' as TimeOfDaySetting,
  debug: false,
  frameRate: 'auto' as FrameRateSetting,
}

/** Visitor's display preferences from the settings menu, remembered between visits. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      learnedQuality: null,
      setAnimations: (on) => set({ animations: on }),
      setQuality: (quality) => set({ quality }),
      setLearnedQuality: (learnedQuality) => set({ learnedQuality }),
      setCameraDrift: (on) => set({ cameraDrift: on }),
      setDust: (on) => set({ dust: on }),
      setSound: (on) => set({ sound: on }),
      setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
      setDebug: (on) => set({ debug: on }),
      setFrameRate: (frameRate) => set({ frameRate }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'portfolio-settings',
      storage: createJSONStorage(() => safeStorage),
      // v1 replaced the "Visual effects" switch with the Quality setting.
      version: 1,
      migrate: (persisted) => {
        const { effects: _effects, ...rest } = (persisted ?? {}) as Record<string, unknown>
        return { ...rest, quality: 'auto', learnedQuality: null } as unknown as SettingsState
      },
    },
  ),
)
