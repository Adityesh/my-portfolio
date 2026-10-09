// Where the camera can be: the isometric room view, or first-person viewpoints inside the room.
// Positions and framing live in components/scene/roomLayout.ts (VIEWPOINT_POSES).
export const VIEWPOINTS = ['room', 'door', 'desk', 'bed', 'window', 'cat'] as const
export type Viewpoint = (typeof VIEWPOINTS)[number]
export type PovViewpoint = Exclude<Viewpoint, 'room'>

export const VIEWPOINT_LABELS: Record<Viewpoint, string> = {
  room: 'Room',
  door: 'Door',
  desk: 'Desk',
  bed: 'Bed',
  window: 'Window',
  cat: 'Cat',
}

/** Longer names for screen readers and tooltips. */
export const VIEWPOINT_DESCRIPTIONS: Record<Viewpoint, string> = {
  room: 'Whole room (overview)',
  door: 'Standing in the doorway',
  desk: 'Sitting at the desk',
  bed: 'Sitting on the bed',
  window: 'At the window',
  cat: "The cat's view",
}

// Entering or leaving a first-person view cuts through a quick fade to dark (the camera type changes).
export const CUT_FADE_MS = 350
// How long the screen stays dark before fading back in (lets the new camera settle for a frame or two).
export const CUT_HOLD_MS = 120
