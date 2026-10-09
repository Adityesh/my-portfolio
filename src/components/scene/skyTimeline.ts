import * as THREE from 'three'

// What the window shows over a day, as keyframes by local hour; values blend between neighbouring keyframes.
// Sky colours run top to bottom: top, middle (55% down), low (82% down), horizon (bottom of the panel).
type SkyKey = {
  hour: number
  top: string
  middle: string
  low: string
  horizon: string
  /** 0..1 */
  stars: number
  moon: number
  sun: number
  /** 0 = on the horizon, 1 = high in the window. */
  sunHeight: number
  sunColor: string
  cloud: string
  cloudOpacity: number
  /** 0 = night, 1 = full daylight coming through the window (drives the room lighting). */
  daylight: number
  /** Colour of the light coming in through the window (streetlight at night, sun by day). */
  windowLight: string
}

const NIGHT: Omit<SkyKey, 'hour'> = {
  top: '#070b24',
  middle: '#141c46',
  low: '#3a2f52',
  horizon: '#7a4a3c',
  stars: 1,
  moon: 1,
  sun: 0,
  sunHeight: 0,
  sunColor: '#ff9a5c',
  cloud: '#8f9ccc',
  cloudOpacity: 1,
  daylight: 0,
  windowLight: '#ffb36b',
}

const DAY: Omit<SkyKey, 'hour'> = {
  top: '#2f74d0',
  middle: '#66a6ea',
  low: '#a9d0f4',
  horizon: '#dcebf7',
  stars: 0,
  moon: 0,
  sun: 1,
  sunHeight: 1,
  sunColor: '#fff6e0',
  cloud: '#ffffff',
  cloudOpacity: 0.9,
  daylight: 1,
  windowLight: '#fff1dc',
}

const KEYS: SkyKey[] = [
  { hour: 0, ...NIGHT },
  { hour: 5, ...NIGHT },
  // Pre-dawn: the sky lightens and the stars fade before the sun shows.
  { hour: 5.6, ...NIGHT, top: '#141b4a', middle: '#2c2f6a', low: '#7a4f78', horizon: '#c0707a', stars: 0.5, moon: 0, daylight: 0.1 },
  {
    hour: 6.3,
    top: '#2a3a78',
    middle: '#6b6aa8',
    low: '#e89a8a',
    horizon: '#ffc58a',
    stars: 0.1,
    moon: 0,
    sun: 0.9,
    sunHeight: 0.05,
    sunColor: '#ffb070',
    cloud: '#f2b4b8',
    cloudOpacity: 0.85,
    daylight: 0.4,
    windowLight: '#ffc9a0',
  },
  { hour: 8, ...DAY, top: '#3d7fd6', middle: '#75aee8', low: '#b5d6f2', horizon: '#e6eef5', sunHeight: 0.6, daylight: 0.85 },
  { hour: 13, ...DAY },
  { hour: 16.5, ...DAY, sunHeight: 0.55, sunColor: '#ffe9c4', daylight: 0.85, windowLight: '#ffe6c4' },
  {
    hour: 18.7,
    top: '#2b2f6e',
    middle: '#8a4f88',
    low: '#f07a5a',
    horizon: '#ffb36b',
    stars: 0.05,
    moon: 0,
    sun: 0.9,
    sunHeight: 0.05,
    sunColor: '#ff8a50',
    cloud: '#e8a090',
    cloudOpacity: 0.85,
    daylight: 0.4,
    windowLight: '#ffb07a',
  },
  // Twilight: the sun is down and the stars come out; the moon only rises once it is fully night.
  { hour: 19.6, ...NIGHT, top: '#0e1236', middle: '#2a2a66', low: '#6a3f6a', horizon: '#b0603e', stars: 0.6, moon: 0, daylight: 0.12 },
  { hour: 20.8, ...NIGHT },
  { hour: 24, ...NIGHT },
]

const COLOR_FIELDS = ['top', 'middle', 'low', 'horizon', 'sunColor', 'cloud', 'windowLight'] as const
const NUMBER_FIELDS = ['stars', 'moon', 'sun', 'sunHeight', 'cloudOpacity', 'daylight'] as const

type ColorField = (typeof COLOR_FIELDS)[number]
type NumberField = (typeof NUMBER_FIELDS)[number]

export type SkyState = Record<ColorField, THREE.Color> &
  Record<NumberField, number> & {
    /** The hour currently shown (eases toward the target when it jumps, like a quick time-lapse). */
    hour: number
    /** Bumped whenever the values change, so readers only update when they need to. */
    version: number
  }

// Keyframe colours, parsed once.
const KEY_COLORS = KEYS.map((key) => Object.fromEntries(COLOR_FIELDS.map((f) => [f, new THREE.Color(key[f])])) as Record<ColorField, THREE.Color>)

/**
 * The sky the scene is showing right now. A single shared object: SkyClock writes it at the start of each
 * frame, and the window, lights and effects read it in their own frame callbacks.
 */
export const sky: SkyState = {
  ...(Object.fromEntries(COLOR_FIELDS.map((f) => [f, new THREE.Color()])) as Record<ColorField, THREE.Color>),
  ...(Object.fromEntries(NUMBER_FIELDS.map((f) => [f, 0])) as Record<NumberField, number>),
  hour: -1,
  version: 0,
}

const smooth = (x: number) => x * x * (3 - 2 * x)

/** Sets `sky` to the blend of keyframes at `hour` (0..24). */
export function setSkyHour(hour: number): void {
  const h = ((hour % 24) + 24) % 24
  let i = 0
  while (i < KEYS.length - 2 && KEYS[i + 1].hour <= h) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const t = smooth((h - a.hour) / (b.hour - a.hour))
  for (const f of COLOR_FIELDS) sky[f].lerpColors(KEY_COLORS[i][f], KEY_COLORS[i + 1][f], t)
  for (const f of NUMBER_FIELDS) sky[f] = THREE.MathUtils.lerp(a[f], b[f], t)
  sky.hour = h
  sky.version++
}
