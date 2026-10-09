import { create } from 'zustand'

// Registry of the things you can poke in the room. 3D objects register themselves here (scene/useInteractive.ts),
// which drives the hover labels and the keyboard-accessible "Things in the room" list (UI), without either side
// importing the other.
export type Interactive = {
  id: string
  /** Short name shown in the label, e.g. "Lava lamp". */
  name: string
  /** What tapping does right now, e.g. "Change colour" or "Turn on". */
  action: string
  /** World position the label floats at. */
  anchor: [number, number, number]
  /** Listed for keyboard/screen-reader users (objects with their own DOM route, like the monitor, aren't). */
  keyboard: boolean
  /** Position in the keyboard list. */
  order: number
  activate: () => void
}

type InteractivesState = {
  entries: Record<string, Interactive>
  /** Under the pointer. */
  hovered: string | null
  /** Focused in the keyboard list. */
  focused: string | null
  /** Screen position (CSS px, relative to the viewport) of the label for the hovered/focused object. */
  labelAt: { x: number; y: number } | null
  register: (entry: Interactive) => void
  unregister: (id: string) => void
  setHovered: (id: string | null) => void
  setFocused: (id: string | null) => void
  setLabelAt: (at: { x: number; y: number } | null) => void
}

export const useInteractives = create<InteractivesState>((set) => ({
  entries: {},
  hovered: null,
  focused: null,
  labelAt: null,
  register: (entry) => set((state) => ({ entries: { ...state.entries, [entry.id]: entry } })),
  unregister: (id) =>
    set((state) => {
      const { [id]: _removed, ...entries } = state.entries
      return {
        entries,
        hovered: state.hovered === id ? null : state.hovered,
        focused: state.focused === id ? null : state.focused,
      }
    }),
  setHovered: (hovered) => set({ hovered }),
  setFocused: (focused) => set({ focused }),
  setLabelAt: (labelAt) => set({ labelAt }),
}))

/** The object whose label should show: keyboard focus wins over the pointer. */
export function activeInteractive(state: Pick<InteractivesState, 'hovered' | 'focused'>): string | null {
  return state.focused ?? state.hovered
}
