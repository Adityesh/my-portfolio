import { create } from 'zustand'

export type View = 'room' | 'monitor'


type AppState = {
  /** Where the camera is (or is heading). */
  view: View
  /** True while the camera is animating between views. */
  transitioning: boolean
  /** Pointer is over the monitor (room view only). */
  monitorHovered: boolean
  /** Asset loading, published by the scene (so UI doesn't import 3D libraries). */
  loading: { active: boolean; progress: number }
  openMonitor: () => void
  closeMonitor: () => void
  finishTransition: () => void
  setMonitorHovered: (hovered: boolean) => void
  setLoading: (loading: { active: boolean; progress: number }) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'room',
  transitioning: false,
  monitorHovered: false,
  // Active from the start: covers downloading the 3D code itself, before the scene can report progress.
  loading: { active: true, progress: 0 },
  openMonitor: () => {
    if (get().view === 'room' && !get().transitioning) set({ view: 'monitor', transitioning: true, monitorHovered: false })
  },
  closeMonitor: () => {
    if (get().view === 'monitor') set({ view: 'room', transitioning: true })
  },
  finishTransition: () => set({ transitioning: false }),
  setMonitorHovered: (hovered) => set({ monitorHovered: hovered }),
  setLoading: (loading) => set({ loading }),
}))
