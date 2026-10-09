import * as THREE from 'three'
import type { RgbMode } from '../../store/rgbModes.ts'

// Colours for the RGB lighting modes (tap the PC tower). Each glowing part asks for its target colour and level
// every frame and eases toward it, so switching modes crossfades.
export type RgbRole = 'pc' | 'backlight' | 'underglow' | 'bed'

// Classic: the original look. The PC slowly cycles; the LED strips hold their violet/indigo.
const CLASSIC: Record<Exclude<RgbRole, 'pc'>, THREE.Color> = {
  backlight: new THREE.Color('#8b5cf6'),
  underglow: new THREE.Color('#6366f1'),
  bed: new THREE.Color('#7c3aed'),
}
const PC_CYCLE_SECONDS = 16
// Rainbow: everything cycles together, each part a little ahead of the last so colour flows around the room.
const RAINBOW_CYCLE_SECONDS = 10
const RAINBOW_PHASE: Record<RgbRole, number> = { pc: 0, backlight: 0.08, underglow: 0.16, bed: 0.24 }
// Aurora: drifts between cyan and violet and breathes.
const AURORA = { hueFrom: 0.5, hueTo: 0.78, drift: 0.45, breath: 0.9, phase: { pc: 0, backlight: 1.2, underglow: 2.4, bed: 3.6 } }
// Ember: warm red-orange with a soft, uneven flicker.
const EMBER = { hueFrom: 0.01, hueTo: 0.07, phase: { pc: 0, backlight: 2.1, underglow: 4.3, bed: 1.1 } }
// Off: LEDs dark, the PC's glass just barely lit.
const OFF_PC_LEVEL = 0.12

// Lightness: the PC glass is tinted through its texture (darker), the LEDs are bright strips.
const LIGHTNESS: Record<RgbRole, number> = { pc: 0.45, backlight: 0.6, underglow: 0.6, bed: 0.55 }
const SATURATION = 0.9

/**
 * Target colour (written to `out`) and level (0..1, a multiplier on the part's own brightness) for `role` in
 * `mode` at time `t` seconds. With animations off, pass a constant `t` for a still colour.
 */
export function rgbTarget(mode: RgbMode, role: RgbRole, t: number, out: THREE.Color): number {
  const l = LIGHTNESS[role]
  switch (mode) {
    case 'classic':
      if (role === 'pc') out.setHSL((t / PC_CYCLE_SECONDS) % 1, SATURATION, l)
      else out.copy(CLASSIC[role])
      return 1
    case 'rainbow':
      out.setHSL((t / RAINBOW_CYCLE_SECONDS + RAINBOW_PHASE[role]) % 1, SATURATION, l)
      return 1
    case 'aurora': {
      const p = AURORA.phase[role]
      const drift = 0.5 + 0.5 * Math.sin(t * AURORA.drift + p)
      out.setHSL(THREE.MathUtils.lerp(AURORA.hueFrom, AURORA.hueTo, drift), SATURATION, l)
      return 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * AURORA.breath + p))
    }
    case 'ember': {
      const p = EMBER.phase[role]
      const flicker = 0.5 + 0.25 * Math.sin(t * 7.3 + p) + 0.15 * Math.sin(t * 13.1 + p * 2) + 0.1 * Math.sin(t * 2.3 + p)
      out.setHSL(THREE.MathUtils.lerp(EMBER.hueFrom, EMBER.hueTo, flicker), 1, l)
      return 0.7 + 0.3 * flicker
    }
    case 'off':
      if (role === 'pc') out.setHSL(0.62, 0.5, l)
      else out.copy(CLASSIC[role])
      return role === 'pc' ? OFF_PC_LEVEL : 0
  }
}

/** Damping rate for the crossfade when the mode changes (~0.5 s). */
export const RGB_FADE = 6

