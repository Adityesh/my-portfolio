import { Effect } from 'postprocessing'
import { LinearSRGBColorSpace, SRGBColorSpace } from 'three'

// Clamps colour channels to >= 0 inside the merged effect pass.
//
// The colour grade can push dark channels below zero: the saturation boost (dark channels below the pixel's average
// go further down) and BrightnessContrast ((c - 0.5) / (1 - contrast) + 0.5 is about -0.03 for c = 0). The merged pass
// converts between linear and sRGB around effects that work in sRGB (BrightnessContrast does) with pow(), and a pow()
// of a negative number is NaN in GLSL (mix() evaluates both branches, so it can't be avoided there). GPUs turn NaN
// into 0 or 1 when writing the screen: darkened/tinted pixels on some, a fully white screen on others.
//
// So one clamp goes before the conversion into sRGB (a linear-space effect after HueSaturation) and one before the
// conversion back (an sRGB-space effect after BrightnessContrast).
const fragmentShader = /* glsl */ `
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = vec4(max(inputColor.rgb, vec3(0.0)), inputColor.a);
  }
`

export class ClampNegativeEffect extends Effect {
  /** `space`: where in the pass it runs; 'srgb' puts it inside the sRGB section with BrightnessContrast. */
  constructor(space: 'linear' | 'srgb') {
    super(space === 'srgb' ? 'ClampNegativeSRGBEffect' : 'ClampNegativeEffect', fragmentShader)
    this.inputColorSpace = space === 'srgb' ? SRGBColorSpace : LinearSRGBColorSpace
  }
}
