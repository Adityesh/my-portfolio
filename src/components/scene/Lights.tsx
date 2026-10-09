import { Environment } from '@react-three/drei'
import { useState } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'

// Required once for rectAreaLight to affect MeshStandardMaterial.
RectAreaLightUniformsLib.init()

// Late-night mood: the monitor is the main light source, the window adds a soft glow.
// Room bounds are roughly x/z -4.7..5, y -0.4..6.9. Walls are at x≈-4.7 (door, desk) and z≈-4.7 (window).
const SCREEN_CENTER: [number, number, number] = [-3.70, 2.47, -1.132]
const SCREEN_SIZE: [number, number] = [2.3, 1.3]
const WINDOW_CENTER: [number, number, number] = [-0.5, 3.0, -4.68]
// Where the window light lands on the floor.
const WINDOW_LIGHT_TARGET: [number, number, number] = [WINDOW_CENTER[0] + 1, -0.37, WINDOW_CENTER[2] + 3]

type LightsProps = {
  shadows: boolean
}

function Lights({ shadows }: LightsProps) {
  // A spot light's target must be in the scene for its position to take effect.
  const [windowTarget] = useState(() => {
    const target = new THREE.Object3D()
    target.position.set(...WINDOW_LIGHT_TARGET)
    return target
  })

  return (
    <>
      <primitive object={windowTarget} />
      <ambientLight intensity={0.1} color="#8a9cff" />
      {/* Self-hosted "Dikhololo Night" HDRI (Poly Haven, CC0), downscaled to 256x128; same image as drei's "night" preset. */}
      <Environment files="/hdri/night_256.hdr" environmentIntensity={0.15} />

      {/* Monitor: area light facing into the room (+x), plus a soft spill on the desk. */}
      <rectAreaLight
        position={SCREEN_CENTER}
        rotation={[0, -Math.PI / 2, 0]}
        width={SCREEN_SIZE[0]}
        height={SCREEN_SIZE[1]}
        intensity={6}
        color="#a8c8ff"
      />
      <pointLight
        position={[SCREEN_CENTER[0] + 1.2, SCREEN_CENTER[1] - 0.3, SCREEN_CENTER[2]]}
        intensity={4}
        distance={8}
        color="#7fb0ff"
      />

      {/* Window: warm streetlight spilling in, placed just inside the opening (the walls would block it from outside). */}
      <spotLight
        position={[WINDOW_CENTER[0], WINDOW_CENTER[1] + 0.8, WINDOW_CENTER[2] + 0.4]}
        target={windowTarget}
        angle={0.7}
        penumbra={1}
        intensity={40}
        distance={10}
        color="#ffb36b"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <pointLight
        position={[WINDOW_CENTER[0], WINDOW_CENTER[1], WINDOW_CENTER[2] + 0.6]}
        intensity={2}
        distance={5}
        color="#ffc58a"
      />
    </>
  )
}

export default Lights
