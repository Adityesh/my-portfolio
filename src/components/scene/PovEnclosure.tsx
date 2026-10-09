import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { DRACO_PATH } from './assetPaths.ts'
import { FLOOR_Y, ROOM_BOUNDS as B } from './roomLayout.ts'

// The model is a cut-away: two walls and no ceiling. From the isometric view that's the point, but from inside the
// room (first-person views) you'd look straight into the void, so these close it up: a ceiling and the two missing
// walls, in the room's own concrete texture. Only mounted in first-person views.
const MODEL_URL = '/models/room.glb'
// Texture repeats across each surface (about one tile per three units, close to the real walls).
const TILE = 3.2
const WIDTH = B.maxX - B.minX
const DEPTH = B.maxZ - B.minZ
const HEIGHT = B.ceilingY - FLOOR_Y
const MID: [number, number, number] = [(B.minX + B.maxX) / 2, (FLOOR_Y + B.ceilingY) / 2, (B.minZ + B.maxZ) / 2]

type Surface = { position: [number, number, number]; rotation: [number, number, number]; size: [number, number] }

const SURFACES: Surface[] = [
  // Ceiling, facing down.
  { position: [MID[0], B.ceilingY, MID[2]], rotation: [Math.PI / 2, 0, 0], size: [WIDTH, DEPTH] },
  // The open +x side, facing into the room (-x).
  { position: [B.maxX, MID[1], MID[2]], rotation: [0, -Math.PI / 2, 0], size: [DEPTH, HEIGHT] },
  // The open +z side, facing into the room (-z).
  { position: [MID[0], MID[1], B.maxZ], rotation: [0, Math.PI, 0], size: [WIDTH, HEIGHT] },
]

type WallMaterials = { pared: THREE.MeshStandardMaterial }

const noRaycast = () => undefined

/** Ceiling and the two missing walls, for first-person views. */
function PovEnclosure() {
  const { materials } = useGLTF(MODEL_URL, DRACO_PATH) as unknown as { materials: WallMaterials }

  // One material per surface, each with the wall texture tiled to its size.
  const surfaceMaterials = useMemo(
    () =>
      SURFACES.map(({ size }) => {
        const material = materials.pared.clone()
        if (materials.pared.map) {
          const map = materials.pared.map.clone()
          map.wrapS = map.wrapT = THREE.RepeatWrapping
          map.repeat.set(size[0] / TILE, size[1] / TILE)
          map.needsUpdate = true
          material.map = map
        }
        material.side = THREE.FrontSide
        return material
      }),
    [materials],
  )
  useEffect(
    () => () =>
      surfaceMaterials.forEach((material) => {
        material.map?.dispose()
        material.dispose()
      }),
    [surfaceMaterials],
  )

  return (
    <>
      {SURFACES.map(({ position, rotation, size }, i) => (
        // Not clickable: it only closes the view, nothing behind it is reachable anyway.
        <mesh key={i} position={position} rotation={rotation} material={surfaceMaterials[i]} raycast={noRaycast} receiveShadow>
          <planeGeometry args={size} />
        </mesh>
      ))}
    </>
  )
}

export default PovEnclosure
