// Rendering quality levels, cheapest first, and what each one turns on.
export const QUALITY_LEVELS = ['minimal', 'low', 'medium', 'high'] as const
export type QualityLevel = (typeof QUALITY_LEVELS)[number]
export type QualitySetting = 'auto' | QualityLevel

export type QualityConfig = {
  /** Canvas pixel ratio range (clamped to the device's own ratio). Below 1 renders slightly soft. */
  dpr: [number, number]
  /** Post-processing; none of these means no composer at all. */
  bloom: boolean
  ambientOcclusion: boolean
  grain: boolean
  contactShadows: boolean
  /** Full set of real-time lights, or the "lite" set (no decorative wall washes). */
  fullLights: boolean
  /** Shadow maps (window spotlight). */
  shadows: boolean
  /** Dust particle density, 0 = off. */
  dust: number
}

// Steps are ordered so the cheapest visual sacrifices come first: pixel ratio and effects (instant),
// then lights and shadows (these change shader programs, which causes a brief recompile hitch).
export const QUALITY_CONFIG: Record<QualityLevel, QualityConfig> = {
  high: { dpr: [1, 2], bloom: true, ambientOcclusion: true, grain: true, contactShadows: true, fullLights: true, shadows: true, dust: 1 },
  medium: { dpr: [1, 1.5], bloom: true, ambientOcclusion: false, grain: true, contactShadows: true, fullLights: true, shadows: true, dust: 1 },
  low: { dpr: [1, 1.5], bloom: false, ambientOcclusion: false, grain: false, contactShadows: false, fullLights: false, shadows: false, dust: 0.5 },
  minimal: { dpr: [0.75, 0.75], bloom: false, ambientOcclusion: false, grain: false, contactShadows: false, fullLights: false, shadows: false, dust: 0 },
}

export const QUALITY_LABELS: Record<QualityLevel, string> = { high: 'High', medium: 'Medium', low: 'Low', minimal: 'Minimal' }

export function stepDown(level: QualityLevel): QualityLevel {
  return QUALITY_LEVELS[Math.max(0, QUALITY_LEVELS.indexOf(level) - 1)]
}

export function stepUp(level: QualityLevel): QualityLevel {
  return QUALITY_LEVELS[Math.min(QUALITY_LEVELS.length - 1, QUALITY_LEVELS.indexOf(level) + 1)]
}

/** Starting level: a fixed choice, else the level this device settled on last time, else a guess. */
export function initialQuality(setting: QualitySetting, learned: QualityLevel | null, isMobile: boolean): QualityLevel {
  if (setting !== 'auto') return setting
  return learned ?? (isMobile ? 'low' : 'high')
}
