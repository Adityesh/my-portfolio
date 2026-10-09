import { create } from 'zustand'

export type View = 'room' | 'monitor'

type AppState = {
  /** Where the camera is (or is heading). */
  view: View
  /** True while the camera is animating between views. */
  transitioning: boolean
  /** Pointer is over the monitor (room view only). */
  monitorHovered: boolean
  openMonitor: () => void
  closeMonitor: () => void
  finishTransition: () => void
  setMonitorHovered: (hovered: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'room',
  transitioning: false,
  monitorHovered: false,
  openMonitor: () => {
    if (get().view === 'room' && !get().transitioning) set({ view: 'monitor', transitioning: true, monitorHovered: false })
  },
  closeMonitor: () => {
    if (get().view === 'monitor') set({ view: 'room', transitioning: true })
  },
  finishTransition: () => set({ transitioning: false }),
  setMonitorHovered: (hovered) => set({ monitorHovered: hovered }),
}))
