import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { playCreak } from '../../audio/sfx.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { useAnimationsEnabled } from './introTimeline.ts'
import { doorMotion } from './doorMotion.ts'
import { DOOR_LEAF } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

// A slow creak open, a little quicker to close (damping rates).
const OPEN_RATE = 1.8
const CLOSE_RATE = 2.6
// Hit area over the doorway, just in front of the handle (which sticks out to x ~-4.04).
const HIT_X = -4.0
const [MIN_X, MIN_Y, MIN_Z] = DOOR_LEAF.min
const [, MAX_Y, MAX_Z] = DOOR_LEAF.max
const [HINGE_X, , HINGE_Z] = DOOR_LEAF.hinge

type DoorProps = {
  /** The door leaf, cut out of the merged furniture mesh (Room.tsx). */
  geometry: THREE.BufferGeometry
  material: THREE.Material
  /** Transform of the merged mesh it came from. */
  position: [number, number, number]
  scale: number
}

/** The room's door: tap it to swing it partway open onto the glow beyond (and again to close it). */
function Door({ geometry, material, position, scale }: DoorProps) {
  const animate = useAnimationsEnabled()
  const invalidate = useThree((state) => state.invalidate)
  const open = useAppStore((state) => state.doorOpen)
  const setOpen = useAppStore((state) => state.setDoorOpen)
  const sound = useSettingsStore((state) => state.sound)
  const pivot = useRef<THREE.Group>(null)
  // 0 = shut, 1 = fully open.
  const level = useRef(open ? 1 : 0)

  const { bind } = useTapTarget(
    () => {
      setOpen(!open)
      if (sound) playCreak(!open)
    },
    {
      id: 'door',
      name: 'Door',
      action: open ? 'Close it' : 'Open it',
      anchor: [MIN_X + 0.3, MAX_Y + 0.15, (MIN_Z + MAX_Z) / 2],
      order: 11,
    },
  )

  useFrame((_, delta) => {
    const target = open ? 1 : 0
    if (level.current !== target) {
      if (!animate) level.current = target
      else {
        const next = THREE.MathUtils.damp(level.current, target, open ? OPEN_RATE : CLOSE_RATE, delta)
        level.current = Math.abs(next - target) < 0.001 ? target : next
        invalidate()
      }
    }
    // Positive turn about the hinge swings the free edge into the room (+x), partway open.
    if (pivot.current) pivot.current.rotation.y = DOOR_LEAF.openAngle * level.current
    doorMotion.level = level.current
  })

  return (
    <>
      {/* The pivot sits on the hinge; the leaf is offset back so it starts where it was. */}
      <group ref={pivot} position={[HINGE_X, 0, HINGE_Z]}>
        <mesh
          castShadow
          receiveShadow
          geometry={geometry}
          material={material}
          position={[position[0] - HINGE_X, position[1], position[2] - HINGE_Z]}
          scale={scale}
        />
      </group>
      {/* Hit area over the doorway, fixed (not swinging with the leaf), so the open doorway closes it too. */}
      <mesh position={[HIT_X, (MIN_Y + MAX_Y) / 2, (MIN_Z + MAX_Z) / 2]} rotation={[0, Math.PI / 2, 0]} {...bind}>
        <planeGeometry args={[MAX_Z - MIN_Z - 0.1, MAX_Y - MIN_Y - 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}

export default Door
