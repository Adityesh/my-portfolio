import { lazy, Suspense, useEffect } from 'react'
import DebugOverlay from './components/ui/DebugOverlay.tsx'
import FallbackView from './components/ui/FallbackView.tsx'
import LoadingScreen from './components/ui/LoadingScreen.tsx'
import ProjectOverlay from './components/ui/ProjectOverlay.tsx'
import SettingsMenu from './components/ui/SettingsMenu.tsx'
import SocialLinks from './components/ui/SocialLinks.tsx'
import ViewProjectsButton from './components/ui/ViewProjectsButton.tsx'
import { useIsMobile } from './hooks/useIsMobile.ts'
import { hasWebGL, useRenderMode } from './hooks/useRenderMode.ts'

// Split out so visitors who get the fallback page never download three.js.
const SceneCanvas = lazy(() => import('./components/scene/SceneCanvas.tsx'))

// The room model is the biggest download; start it while the 3D code is still loading (3D mode only,
// so the fallback page doesn't fetch it). Matches the request useGLTF makes, so the browser reuses it.
const ROOM_MODEL_URL = '/models/room.glb'
function preloadRoomModel() {
  if (document.querySelector(`link[rel="preload"][href="${ROOM_MODEL_URL}"]`)) return
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'fetch'
  link.type = 'model/gltf-binary'
  link.crossOrigin = 'anonymous'
  link.href = ROOM_MODEL_URL
  document.head.appendChild(link)
}

function App() {
  const [mode, fallBack] = useRenderMode()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (mode === 'full') preloadRoomModel()
  }, [mode])

  if (mode === 'fallback') return <FallbackView canTry3D={hasWebGL()} />

  return (
    <main className="relative h-full w-full">
      <Suspense fallback={null}>
        <SceneCanvas isMobile={isMobile} onContextLost={fallBack} />
      </Suspense>
      <ViewProjectsButton />
      <SocialLinks />
      <ProjectOverlay />
      <SettingsMenu />
      <DebugOverlay />
      <LoadingScreen />
    </main>
  )
}

export default App
