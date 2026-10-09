import { Bloom, EffectComposer } from '@react-three/postprocessing'

// Desktop only; Experience skips this on mobile.
function Effects() {
  return (
    <EffectComposer multisampling={4}>
      {/* High threshold so only emissive surfaces (monitor screen, mouse light) glow. */}
      <Bloom mipmapBlur radius={0.45} intensity={0.5} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
    </EffectComposer>
  )
}

export default Effects
