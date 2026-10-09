import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { NeutralToneMapping } from 'three'
import Experience from './Experience.tsx'
import LoadingReporter from './LoadingReporter.tsx'

type SceneCanvasProps = {
  isMobile: boolean
  /** Called if the GPU drops the WebGL context (common on low-end phones). */
  onContextLost: () => void
}

/** The 3D room. Loaded lazily by App so the fallback page never downloads three.js. */
function SceneCanvas({ isMobile, onContextLost }: SceneCanvasProps) {
  return (
    <>
      <LoadingReporter />
      {/* Orthographic from the start so CameraControls never has to swap cameras.
          Initial values only; useResponsiveCamera sets the real position and zoom. */}
      <Canvas
        orthographic
        camera={{ position: [10, 10, 10], zoom: 60, near: 0.1, far: 100 }}
        // Phones: cap pixel ratio and skip shadow maps (the lights don't cast shadows there anyway).
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        frameloop="demand"
        shadows={isMobile ? false : 'percentage'}
        // Same tone mapping as the desktop post-processing chain (Effects.tsx), so mobile looks alike.
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping
          // Neutral tone mapping darkens the deepest shadows slightly; lift exposure to compensate.
          gl.toneMappingExposure = 1.6
          gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true })
        }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </>
  )
}

export default SceneCanvas
