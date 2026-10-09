import { ContactShadows } from '@react-three/drei'
import { useRef } from 'react'
import type * as THREE from 'three'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import CameraRig from './CameraRig.tsx'
import Effects from './Effects.tsx'
import Lights from './Lights.tsx'
import Room from './Room.tsx'

// Floor height of the room model (suelo mesh), used to place contact shadows.
const FLOOR_Y = -0.373

function Experience() {
  const roomRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()

  return (
    <>
      <CameraRig targetRef={roomRef} />
      <Lights shadows={!isMobile} />
      <group ref={roomRef}>
        <Room />
      </group>
      {!isMobile && (
        <ContactShadows position={[0.1, FLOOR_Y + 0.005, 0.14]} scale={9.5} far={3} blur={2.5} opacity={0.6} frames={1} />
      )}
      {!isMobile && <Effects />}
    </>
  )
}

export default Experience
