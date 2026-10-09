import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// Side effect: plays the breeze while the window is open (and Sound is on).
import '../../audio/breeze.ts'
import { playSlide } from '../../audio/sfx.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { useAnimationsEnabled } from './introTimeline.ts'
import { CURTAIN_DAMPING, WINDOW, WINDOW_SASH } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

// Hit area over the window opening, just inside the frame (the curtains, in front, take taps where they hang).
const HIT_Z = WINDOW.insideZ + 0.03
const HIT_WIDTH = WINDOW.maxX - WINDOW.minX
const HIT_HEIGHT = WINDOW.maxY - WINDOW.minY

type WindowSashProps = {
  /** The right sash, cut out of the merged furniture mesh (Room.tsx). */
  geometry: THREE.BufferGeometry
  material: THREE.Material
  /** Transform of the merged mesh it came from. */
  position: [number, number, number]
  scale: number
}

/** The window's right sash: tap the window to slide it open over the left sash (and let the breeze in). */
function WindowSash({ geometry, material, position, scale }: WindowSashProps) {
  const animate = useAnimationsEnabled()
  const invalidate = useThree((state) => state.invalidate)
  const open = useAppStore((state) => state.windowOpen)
  const setOpen = useAppStore((state) => state.setWindowOpen)
  const sound = useSettingsStore((state) => state.sound)
  const sash = useRef<THREE.Mesh>(null)
  // 0 = closed, 1 = slid open.
  const level = useRef(open ? 1 : 0)

  const { bind } = useTapTarget(
    () => {
      setOpen(!open)
      if (sound) playSlide(!open)
    },
    {
      id: 'window',
      name: 'Window',
      action: open ? 'Close it' : 'Open it',
      anchor: [(WINDOW.minX + WINDOW.maxX) / 2, WINDOW.minY + 0.35, WINDOW.insideZ + 0.2],
      order: 5,
    },
  )

  useFrame((_, delta) => {
    const target = open ? 1 : 0
    if (level.current !== target) {
      if (!animate) level.current = target
      else {
        const next = THREE.MathUtils.damp(level.current, target, CURTAIN_DAMPING, delta)
        level.current = Math.abs(next - target) < 0.001 ? target : next
        invalidate()
      }
    }
    if (sash.current) sash.current.position.x = position[0] + WINDOW_SASH.slide * level.current
  })

  return (
    <>
      <mesh ref={sash} castShadow receiveShadow geometry={geometry} material={material} position={position} scale={scale} />
      <mesh position={[(WINDOW.minX + WINDOW.maxX) / 2, (WINDOW.minY + WINDOW.maxY) / 2, HIT_Z]} {...bind}>
        <planeGeometry args={[HIT_WIDTH, HIT_HEIGHT]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}

export default WindowSash
