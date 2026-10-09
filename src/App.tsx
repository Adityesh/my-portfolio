import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Experience from './components/scene/Experience.tsx'
import LoadingScreen from './components/ui/LoadingScreen.tsx'

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
        shadows
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <LoadingScreen />
    </main>
  )
}

export default App
