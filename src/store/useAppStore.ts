import { create } from 'zustand'
import type { QualityLevel } from './quality.ts'
import { CUT_FADE_MS, CUT_HOLD_MS, type Viewpoint } from './viewpoints.ts'

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
  /** The ceiling light is on (wall switch by the door, or the settings menu). */
  roomLight: boolean
  /** The bedside lamp is on (tap the lamp). */
  bedLamp: boolean
  /** Lo-fi music from the headphones is wanted (it only plays while Sound is on). */
  music: boolean
  /** Camera viewpoint: the isometric room view or a first-person spot inside the room (room view only). */
  viewpoint: Viewpoint
  /** The screen is (going) dark for a camera cut between the room view and a first-person view. */
  cutting: boolean
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
  setRoomLight: (on: boolean) => void
  setBedLamp: (on: boolean) => void
  setMusic: (on: boolean) => void
  /** Moves the camera: cuts through a fade between the room view and first person, glides between first-person spots. */
  goToViewpoint: (viewpoint: Viewpoint) => void
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

/** Fades the screen to dark, runs `change` while it's dark, then fades back in. */
function cutThrough(change: () => void) {
  useAppStore.setState({ cutting: true })
  window.setTimeout(() => {
    change()
    window.setTimeout(() => useAppStore.setState({ cutting: false }), CUT_HOLD_MS)
  }, CUT_FADE_MS)
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'room',
  transitioning: false,
  roomLight: false,
  bedLamp: true,
  music: false,
  viewpoint: 'room',
  cutting: false,
  monitorHovered: false,
  // Active from the start: covers downloading the 3D code itself, before the scene can report progress.
  loading: { active: true, progress: 0 },
  sceneReady: false,
  debugStats: null,
  frameCap: null,
  quality: null,
  qualityOverride: null,
  setRoomLight: (roomLight) => set({ roomLight }),
  setBedLamp: (bedLamp) => set({ bedLamp }),
  setMusic: (music) => set({ music }),
  goToViewpoint: (viewpoint) => {
    const { view, transitioning, cutting, viewpoint: current } = get()
    if (view !== 'room' || transitioning || cutting || viewpoint === current) return
    // First person to first person: the perspective camera glides there.
    if (current !== 'room' && viewpoint !== 'room') {
      set({ viewpoint })
      return
    }
    cutThrough(() => set({ viewpoint }))
  },
  openMonitor: () => {
    const { view, transitioning, cutting, viewpoint } = get()
    if (view !== 'room' || transitioning || cutting) return
    const open = () => set({ view: 'monitor', transitioning: true, monitorHovered: false })
    // From first person, cut back to the room camera (which then zooms into the screen) behind the fade.
    if (viewpoint !== 'room') {
      cutThrough(() => {
        set({ viewpoint: 'room' })
        open()
      })
      return
    }
    open()
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
