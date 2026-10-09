// World-space positions of room features, measured from models-src/room.glb.
// Room bounds: x -4.72..4.91, y -0.86..6.86, z -4.68..4.96.
// Walls stand at x≈-4.7 (door, desk) and z≈-4.7 (window); the +x and +z sides are open toward the camera.

type Vec3 = [number, number, number]

/** Top surface of the floor (suelo mesh). */
export const FLOOR_Y = -0.373

/** Monitor screen (Object_34): faces +x into the room. Size is [width along z, height]. */
export const SCREEN_CENTER: Vec3 = [-3.79, 2.47, -1.13]
export const SCREEN_SIZE: [number, number] = [2.3, 1.3]

/** Window opening in the z-min wall. The wall runs from z -4.68 (outside) to -4.20 (inside). */
export const WINDOW = {
  minX: -1.66,
  maxX: 1.62,
  minY: 1.51,
  maxY: 4.97,
  insideZ: -4.2,
  outsideZ: -4.68,
} as const

export const WINDOW_CENTER: Vec3 = [(WINDOW.minX + WINDOW.maxX) / 2, (WINDOW.minY + WINDOW.maxY) / 2, WINDOW.insideZ]

/**
 * Night-sky panel behind the window. Sized so it fills the opening across the camera's
 * allowed rotation range while staying hidden behind the wall top.
 */
export const SKY_PANEL = {
  minX: -2.8,
  maxX: 1.7,
  minY: 0.5,
  maxY: 5.0,
  z: WINDOW.outsideZ - 0.4,
} as const

/** Bulb inside the bedside lamp's shade. */
export const LAMP_BULB: Vec3 = [0.25, 1.45, -3.31]

/** Desk top (Mesa_18): front edge faces +x, back against the x-min wall. */
export const DESK = {
  topY: 1.37,
  frontX: -2.3,
  backX: -4.15,
  minZ: -3.71,
  maxZ: 0.82,
} as const

/** Inner face of the x-min wall (door/desk side). */
export const LEFT_WALL_X = -4.24

/** Wall clock: on the x-min wall, centred above the monitor (its back sits against the wall). */
export const CLOCK_CENTER: Vec3 = [LEFT_WALL_X + 0.01, 4.35, SCREEN_CENTER[2]]

/** Desk surface height (top of the desk, where small props sit). */
export const DESK_SURFACE_Y = 1.375

/** Props added to the room. Positions are the anchor point (bottom-centre, or back-centre for wall items). */
export const PROPS = {
  rug: { position: [-0.45, FLOOR_Y + 0.002, 1.2] as Vec3, length: 4.4 },
  mug: { position: [-2.72, DESK_SURFACE_Y, 0.42] as Vec3, height: 0.24 },
  plant: { position: [-1.45, FLOOR_Y, -3.4] as Vec3, height: 2.3 },
  whiteboard: { position: [LEFT_WALL_X + 0.01, 3.2, 1.05] as Vec3, width: 1.5 },
  cat: { position: [3.0, 0.92, -0.6] as Vec3, length: 1.3 },
  headphones: { position: [-3.12, DESK_SURFACE_Y, 0.38] as Vec3, width: 0.5, turn: 0.35 },
} as const

/** Top surface of the bed's blanket (sabana mesh). */
export const BED_TOP_Y = 0.94
