import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { NeutralToneMapping } from 'three'
import Experience from './components/scene/Experience.tsx'
import LoadingScreen from './components/ui/LoadingScreen.tsx'
import ProjectOverlay from './components/ui/ProjectOverlay.tsx'
import SocialLinks from './components/ui/SocialLinks.tsx'
import ViewProjectsButton from './components/ui/ViewProjectsButton.tsx'

function App() {
  return (
    <main className="relative h-full w-full">
      {/* Orthographic from the start so CameraControls never has to swap cameras.
          Initial values only; useResponsiveCamera sets the real position and zoom. */}
      <Canvas
        orthographic
        camera={{ position: [10, 10, 10], zoom: 60, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        frameloop="demand"
        shadows="percentage"
        // Same tone mapping as the desktop post-processing chain (Effects.tsx), so mobile looks alike.
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping
          // Neutral tone mapping darkens the deepest shadows slightly; lift exposure to compensate.
          gl.toneMappingExposure = 1.6
        }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <ViewProjectsButton />
      <SocialLinks />
      <ProjectOverlay />
      <LoadingScreen />
    </main>
  )
}

export default App
