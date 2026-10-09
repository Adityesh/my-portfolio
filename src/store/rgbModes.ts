// Lighting modes for the PC's RGB panel and the LED strips (desk backlight, desk underglow, under the bed).
// Tap the PC tower to cycle them; colours per mode live in components/scene/rgbLighting.ts.
export const RGB_MODES = ['classic', 'rainbow', 'aurora', 'ember', 'off'] as const
export type RgbMode = (typeof RGB_MODES)[number]

export const RGB_MODE_LABELS: Record<RgbMode, string> = {
  classic: 'Classic',
  rainbow: 'Rainbow',
  aurora: 'Aurora',
  ember: 'Ember',
  off: 'Off',
}
