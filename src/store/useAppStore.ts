import { create } from 'zustand'

export type View = 'room' | 'monitor'

/** Renderer statistics for the debug overlay (published by the scene while the overlay is on). */
export type DebugStats = {
  fps: number
  frameMs: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  programs: number
  width: number
  height: number
  dpr: number
  gpu: string
}

type AppState = {
  /** Where the camera is (or is heading). */
  view: View
  /** True while the camera is animating between views. */
  transitioning: boolean
  /** Pointer is over the monitor (room view only). */
  monitorHovered: boolean
  /** Asset loading, published by the scene (so UI doesn't import 3D libraries). */
  loading: { active: boolean; progress: number }
  /** The scene has drawn its first frame. */
  sceneReady: boolean
  debugStats: DebugStats | null
  /** Current animation frame cap and whether Auto picked it (published by the frame driver). */
  frameCap: { fps: number; auto: boolean } | null
  openMonitor: () => void
  closeMonitor: () => void
  finishTransition: () => void
  setMonitorHovered: (hovered: boolean) => void
  setLoading: (loading: { active: boolean; progress: number }) => void
  markSceneReady: () => void
  setDebugStats: (stats: DebugStats | null) => void
  setFrameCap: (cap: { fps: number; auto: boolean } | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'room',
  transitioning: false,
  monitorHovered: false,
  // Active from the start: covers downloading the 3D code itself, before the scene can report progress.
  loading: { active: true, progress: 0 },
  sceneReady: false,
  debugStats: null,
  frameCap: null,
  openMonitor: () => {
    if (get().view === 'room' && !get().transitioning) set({ view: 'monitor', transitioning: true, monitorHovered: false })
  },
  closeMonitor: () => {
    if (get().view === 'monitor') set({ view: 'room', transitioning: true })
  },
  finishTransition: () => set({ transitioning: false }),
  setMonitorHovered: (hovered) => set({ monitorHovered: hovered }),
  setLoading: (loading) => set({ loading }),
  markSceneReady: () => set({ sceneReady: true }),
  setDebugStats: (debugStats) => set({ debugStats }),
  setFrameCap: (frameCap) => set({ frameCap }),
}))
