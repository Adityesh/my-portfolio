import { ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useReducedMotion } from '../../hooks/useReducedMotion.ts'
import CameraRig from './CameraRig.tsx'
import DustMotes from './DustMotes.tsx'
import Effects from './Effects.tsx'
import FrameDriver from './FrameDriver.tsx'
import { IntroContext } from './introTimeline.ts'
import Lights from './Lights.tsx'
import Room from './Room.tsx'
import { FLOOR_Y } from './roomLayout.ts'
import WindowBackdrop from './WindowBackdrop.tsx'

// Frame rate for ambient animation (the Canvas renders on demand).
const ANIMATION_FPS = 30

function Experience() {
  const roomRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const gl = useThree((state) => state.gl)

  // Intro clock starts on the first frame after the scene (and the loaded model) mounts.
  const intro = useMemo(() => ({ clock: { start: null }, reducedMotion }), [reducedMotion])

  // Nothing that casts shadows moves, so render shadow maps once instead of every frame.
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
  }, [gl])

  return (
    <IntroContext.Provider value={intro}>
      {!reducedMotion && <FrameDriver fps={ANIMATION_FPS} />}
      <CameraRig targetRef={roomRef} />
      <Lights shadows={!isMobile} />
      <group ref={roomRef}>
        <Room />
      </group>
      <WindowBackdrop />
      {!reducedMotion && <DustMotes density={isMobile ? 0.5 : 1} />}
      {!isMobile && (
        <ContactShadows position={[0.1, FLOOR_Y + 0.005, 0.14]} scale={9.5} far={3} blur={2.5} opacity={0.6} frames={1} />
      )}
      {!isMobile && <Effects />}
    </IntroContext.Provider>
  )
}

export default Experience
