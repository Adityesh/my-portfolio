import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { NeutralToneMapping } from 'three'
import Experience from './components/scene/Experience.tsx'
import FallbackView from './components/ui/FallbackView.tsx'
import LoadingScreen from './components/ui/LoadingScreen.tsx'
import ProjectOverlay from './components/ui/ProjectOverlay.tsx'
import SettingsMenu from './components/ui/SettingsMenu.tsx'
import SocialLinks from './components/ui/SocialLinks.tsx'
import ViewProjectsButton from './components/ui/ViewProjectsButton.tsx'
import { useIsMobile } from './hooks/useIsMobile.ts'
import { hasWebGL, useRenderMode } from './hooks/useRenderMode.ts'

function App() {
  const [mode, fallBack] = useRenderMode()
  const isMobile = useIsMobile()

  if (mode === 'fallback') return <FallbackView canTry3D={hasWebGL()} />

  return (
    <main className="relative h-full w-full">
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
          // If the GPU drops the context (common on low-end phones), switch to the plain page.
          gl.domElement.addEventListener('webglcontextlost', fallBack, { once: true })
        }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <ViewProjectsButton />
      <SocialLinks />
      <ProjectOverlay />
      <SettingsMenu />
      <LoadingScreen />
    </main>
  )
}

export default App
