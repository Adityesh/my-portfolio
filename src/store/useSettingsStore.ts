import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

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

type SettingsState = {
  /** null = follow the OS reduced-motion preference. */
  animations: boolean | null
  /** null = automatic (on for desktop, off for mobile). */
  effects: boolean | null
  cameraDrift: boolean
  dust: boolean
  setAnimations: (on: boolean) => void
  setEffects: (on: boolean) => void
  setCameraDrift: (on: boolean) => void
  setDust: (on: boolean) => void
  reset: () => void
}

const DEFAULTS = { animations: null, effects: null, cameraDrift: true, dust: true }

/** Visitor's display preferences from the settings menu, remembered between visits. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setAnimations: (on) => set({ animations: on }),
      setEffects: (on) => set({ effects: on }),
      setCameraDrift: (on) => set({ cameraDrift: on }),
      setDust: (on) => set({ dust: on }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'portfolio-settings', storage: createJSONStorage(() => safeStorage) },
  ),
)
