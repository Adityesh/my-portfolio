import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  N8AO,
  Noise,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'

type EffectsProps = {
  bloom: boolean
  ambientOcclusion: boolean
  grain: boolean
}

// Which effects run depends on the quality level (Experience only mounts this when at least one is on).
function Effects({ bloom, ambientOcclusion, grain }: EffectsProps) {
  return (
    <EffectComposer multisampling={4}>
      {/* Ambient occlusion: soft contact darkening where furniture meets floor and walls. */}
      <>{ambientOcclusion && <N8AO halfRes quality="medium" aoRadius={0.8} distanceFalloff={1} intensity={1.8} />}</>
      {/* High threshold so only emissive surfaces (screen, moon, LEDs) glow. */}
      <>{bloom && <Bloom mipmapBlur radius={0.45} intensity={0.5} luminanceThreshold={0.9} luminanceSmoothing={0.2} />}</>
      {/* The composer renders off-screen, so tone mapping has to happen here (matches the mobile renderer). */}
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      {/* Light grade: a touch more colour and contrast. */}
      <HueSaturation saturation={0.1} />
      <BrightnessContrast contrast={0.06} />
      {/* Fine grain hides banding in the dark gradients. */}
      <>{grain && <Noise premultiply={false} blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.2} />}</>
    </EffectComposer>
  )
}

export default Effects
