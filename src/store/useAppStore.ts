import { create } from 'zustand'
import type { QualityLevel } from './quality.ts'

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
  /** Current animation frame cap and whether Auto picked it (published by the performance governor). */
  frameCap: { fps: number; auto: boolean } | null
  /**
   * Current rendering quality, whether Auto picked it, whether the safety net overrode the visitor's choice,
   * and the last automatic change (for the menu and debug overlay).
   */
  quality: { level: QualityLevel; auto: boolean; overridden: boolean; note: string } | null
  /** Safety-net level replacing a level the visitor picked (cleared when they pick a level again). */
  qualityOverride: QualityLevel | null
  openMonitor: () => void
  closeMonitor: () => void
  finishTransition: () => void
  setMonitorHovered: (hovered: boolean) => void
  setLoading: (loading: { active: boolean; progress: number }) => void
  markSceneReady: () => void
  setDebugStats: (stats: DebugStats | null) => void
  setFrameCap: (cap: { fps: number; auto: boolean } | null) => void
  setQuality: (quality: { level: QualityLevel; auto: boolean; overridden: boolean; note: string } | null) => void
  setQualityOverride: (level: QualityLevel | null) => void
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
  quality: null,
  qualityOverride: null,
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
  setQuality: (quality) => set({ quality }),
  setQualityOverride: (qualityOverride) => set({ qualityOverride }),
}))
