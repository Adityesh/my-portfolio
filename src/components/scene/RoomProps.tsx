import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import FittedModel from './FittedModel.tsx'
import { useAnimationsEnabled } from './introTimeline.ts'
import MugSteam from './MugSteam.tsx'
import { PROPS } from './roomLayout.ts'
import WhiteboardDrawing from './WhiteboardDrawing.tsx'

// Cat breathing: slow rise and fall.
const BREATH = 0.022
const BREATH_SPEED = 1.5
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
/** Faint self-glow from the texture, for dark props that would otherwise vanish in the dim room. */
const faintGlow = (intensity: number) => (material: THREE.MeshStandardMaterial) => {
  if (!material.map) return
  material.emissiveMap = material.map
  material.emissive.set('#ffffff')
  material.emissiveIntensity = intensity
}
// The lamp lights the cat from behind; the glow keeps its markings readable.
const visibleCat = faintGlow(0.35)
// Dark headphones on a dark desk.
const visibleHeadphones = faintGlow(0.3)
const ceramicMug = (material: THREE.MeshStandardMaterial) => {
  material.color.set('#ece6dc')
  material.roughness = 0.35
  material.metalness = 0
}

/** Extra furniture and decor: rug, mug with steam, floor plant and whiteboard. */
function RoomProps() {
  const animate = useAnimationsEnabled()
  const plant = useRef<THREE.Group>(null)
  const cat = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!animate) return
    const elapsed = state.clock.elapsedTime
    if (plant.current) {
      const t = elapsed * SWAY_SPEED
      plant.current.rotation.z = Math.sin(t) * SWAY
      plant.current.rotation.x = Math.sin(t * 0.7 + 1) * SWAY * 0.6
    }
    if (cat.current) {
      // Scales from the base (FittedModel anchors at the bottom), so the cat rises rather than grows.
      const b = Math.sin(elapsed * BREATH_SPEED)
      cat.current.scale.set(1 + b * BREATH * 0.4, 1 + b * BREATH, 1 + b * BREATH * 0.4)
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

      <FittedModel
        url="/models/mug.glb"
        position={PROPS.mug.position}
        rotation={[0, Math.PI * 0.25, 0]}
        fit={{ axis: 'y', size: PROPS.mug.height }}
        castShadow
        prepareMaterial={ceramicMug}
      >
        {animate && <MugSteam rimHeight={PROPS.mug.height} />}
      </FittedModel>

      <group ref={plant} position={PROPS.plant.position}>
        <FittedModel url="/models/plant.glb" fit={{ axis: 'y', size: PROPS.plant.height }} castShadow />
      </group>

      <group ref={cat} position={PROPS.cat.position} rotation={[0, Math.PI * 0.25, 0]}>
        {/* No shadow: the window spot sits behind the cat and threw a hard dark copy of it onto the bed. */}
        <FittedModel url="/models/cat.glb" fit={{ axis: 'z', size: PROPS.cat.length }} prepareMaterial={visibleCat} />
      </group>

      {/* Lying flat on the desk behind the mug (the model stands upright, so tip it onto its back). */}
      <FittedModel
        url="/models/headphones.glb"
        position={PROPS.headphones.position}
        rotation={[0, PROPS.headphones.turn, 0]}
        modelRotation={[-Math.PI / 2, 0, 0]}
        fit={{ axis: 'x', size: PROPS.headphones.width }}
        castShadow
        prepareMaterial={visibleHeadphones}
      />

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
