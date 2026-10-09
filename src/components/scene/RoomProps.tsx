import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import Cat from './Cat.tsx'
import FittedModel from './FittedModel.tsx'
import Headphones from './Headphones.tsx'
import { useAnimationsEnabled } from './introTimeline.ts'
import Mug from './Mug.tsx'
import { PROPS } from './roomLayout.ts'
import WhiteboardDrawing from './WhiteboardDrawing.tsx'

// Plant sway: tiny rotation so the leaves feel alive.
const SWAY = 0.012
const SWAY_SPEED = 0.7
// Whiteboard model is ~1.62 x 1.22, so its height follows from the width.
const WHITEBOARD_ASPECT = 1.22 / 1.62
// How far the drawing sits in front of the wall (just proud of the board surface).
const DRAWING_OFFSET = 0.045

// Material tweaks so the props sit well in the dim, coloured lighting.
const matteWhiteboard = (material: THREE.MeshStandardMaterial) => {
  // The glossy board caught a hard highlight from the monitor light.
  material.roughness = 0.85
  material.metalness = 0
}
const rugMaterial = (material: THREE.MeshStandardMaterial) => {
  // Richer colours that survive the blue/purple lighting, fully matte like fabric.
  material.color.set(material.name === 'DarkRed' ? '#6b1f24' : '#c9822e')
  material.roughness = 1
  material.metalness = 0
}

/** Extra furniture and decor: rug, mug, floor plant, cat, headphones and whiteboard. */
function RoomProps() {
  const animate = useAnimationsEnabled()
  const plant = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!animate) return
    if (plant.current) {
      const t = state.clock.elapsedTime * SWAY_SPEED
      plant.current.rotation.z = Math.sin(t) * SWAY
      plant.current.rotation.x = Math.sin(t * 0.7 + 1) * SWAY * 0.6
    }
  })

  const whiteboardHeight = PROPS.whiteboard.width * WHITEBOARD_ASPECT

  return (
    <>
      <FittedModel
        url="/models/rug.glb"
        position={PROPS.rug.position}
        fit={{ axis: 'z', size: PROPS.rug.length }}
        receiveShadow
        prepareMaterial={rugMaterial}
      />

      <Mug />

      <group ref={plant} position={PROPS.plant.position}>
        <FittedModel url="/models/plant.glb" fit={{ axis: 'y', size: PROPS.plant.height }} castShadow />
      </group>

      <Cat />

      <Headphones />

      {/* Lies flat in the file: stand it up facing +x (into the room) against the x-min wall. */}
      <FittedModel
        url="/models/whiteboard.glb"
        position={PROPS.whiteboard.position}
        modelRotation={[0, 0, -Math.PI / 2]}
        fit={{ axis: 'z', size: PROPS.whiteboard.width }}
        anchor="back"
        prepareMaterial={matteWhiteboard}
      >
        <group position={[DRAWING_OFFSET, 0, 0]}>
          <WhiteboardDrawing width={PROPS.whiteboard.width * 0.9} height={whiteboardHeight * 0.85} />
        </group>
      </FittedModel>
    </>
  )
}

export default RoomProps
