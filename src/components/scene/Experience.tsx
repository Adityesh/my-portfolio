import { useRef } from 'react'
import type * as THREE from 'three'
import CameraRig from './CameraRig.tsx'
import Lights from './Lights.tsx'
import Room from './Room.tsx'

function Experience() {
  const roomRef = useRef<THREE.Group>(null)

  return (
    <>
      <CameraRig targetRef={roomRef} />
      <Lights />
      <group ref={roomRef}>
        <Room />
      </group>
    </>
  )
}

export default Experience
