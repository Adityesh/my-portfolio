import type * as THREE from 'three'
import Cat from './Cat.tsx'
import FittedModel from './FittedModel.tsx'
import Headphones from './Headphones.tsx'
import Mug from './Mug.tsx'
import Plant from './Plant.tsx'
import { PROPS, WHITEBOARD_ASPECT, WHITEBOARD_DRAWING_OFFSET } from './roomLayout.ts'
import WhiteboardHitArea from './WhiteboardHitArea.tsx'
import WhiteboardDrawing from './WhiteboardDrawing.tsx'

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

/** Extra furniture and decor: rug, mug, floor plant, cat, headphones and whiteboard (tap it for "about me"). */
function RoomProps() {
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
      <Plant />
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
        <group position={[WHITEBOARD_DRAWING_OFFSET, 0, 0]}>
          <WhiteboardDrawing width={PROPS.whiteboard.width * 0.9} height={whiteboardHeight * 0.85} />
        </group>
      </FittedModel>
      <WhiteboardHitArea />
    </>
  )
}

export default RoomProps
