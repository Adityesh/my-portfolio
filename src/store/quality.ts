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

/**
 * Diagnostics: ?diag=nobloom,nograin,noao,nocontact,nolights,noshadows turns individual features off on top
 * of the quality level (for tracking down device-specific rendering bugs). Read once at load.
 */
const DIAG = new Set(
  (typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('diag') ?? ''))
    .split(',')
    .map((flag) => flag.trim())
    .filter(Boolean),
)

function applyDiagnostics<T extends QualityConfig>(config: T): T {
  if (DIAG.size === 0) return config
  return {
    ...config,
    bloom: config.bloom && !DIAG.has('nobloom'),
    grain: config.grain && !DIAG.has('nograin'),
    ambientOcclusion: config.ambientOcclusion && !DIAG.has('noao'),
    contactShadows: config.contactShadows && !DIAG.has('nocontact'),
    fullLights: config.fullLights && !DIAG.has('nolights'),
    shadows: config.shadows && !DIAG.has('noshadows'),
  }
}

/** Active diagnostic flags (shown in the debug overlay). */
export const DIAGNOSTICS = [...DIAG]

/**
 * Phone limits, applied at every level on touch devices:
 * - no ambient occlusion (too heavy: frames take seconds);
 * (Bloom is fine on phones: its earlier white flashes came from NaN pixels in the window shaft shader, now fixed.)
 * - pixel ratio up to 2 at High, 1.5 below.
 * Post-processing renders off-screen, bypassing the canvas's own anti-aliasing, so it always multisamples
 * (4x) to keep edges smooth; Low and Minimal have no post-processing and use the canvas's anti-aliasing.
 */
export function configFor(level: QualityLevel, isMobile: boolean): QualityConfig & { multisampling: number } {
  const config = QUALITY_CONFIG[level]
  if (!isMobile) return applyDiagnostics({ ...config, multisampling: MSAA_SAMPLES })
  const maxDpr = level === 'high' ? 2 : 1.5
  return applyDiagnostics({
    ...config,
    ambientOcclusion: false,
    dpr: [Math.min(config.dpr[0], maxDpr), Math.min(config.dpr[1], maxDpr)],
    multisampling: MSAA_SAMPLES,
  })
}

// Multisample anti-aliasing for the post-processing buffers.
const MSAA_SAMPLES = 4

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
