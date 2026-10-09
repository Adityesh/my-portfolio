import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import FittedModel from './FittedModel.tsx'
import { lightLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { LAVA_LAMP } from './roomLayout.ts'

const MODEL_URL = '/models/lavalamp.glb'
// Model bounds (in its own units): total height -1.389..5.334, glass column 1.39..4.61 with radius 1.
const MODEL_MIN_Y = -1.389
const MODEL_HEIGHT = 6.723
const GLASS = { minY: 1.39, maxY: 4.61, radius: 1 }
// Material names in the model: glass (red), wax (yellow, static, replaced by animated blobs), metal base/cap.
const GLASS_MATERIAL = 'lambert3SG'
const WAX_MATERIAL = 'lambert4SG'
const METAL_MATERIAL = 'lambert2SG'

const SCALE = LAVA_LAMP.height / MODEL_HEIGHT
const GLASS_BOTTOM = (GLASS.minY - MODEL_MIN_Y) * SCALE
const GLASS_TOP = (GLASS.maxY - MODEL_MIN_Y) * SCALE
const GLASS_RADIUS = GLASS.radius * SCALE

const GLASS_COLOR = '#ff2418'
const WAX_COLOR = '#ff7a3d'
const LIGHT_COLOR = '#ff3b2f'
const GLOW_INTENSITY = 2.4

// Wax blobs: [radius as a fraction of the glass radius, speed, phase].
const BLOBS: [number, number, number][] = [
  [0.55, 0.11, 0],
  [0.4, 0.15, 2.1],
  [0.45, 0.09, 4.0],
  [0.32, 0.18, 1.2],
  [0.6, 0.07, 5.3],
]

const prepareLampMaterial = (material: THREE.MeshStandardMaterial, mesh: THREE.Mesh) => {
  if (material.name === WAX_MATERIAL) {
    mesh.visible = false
  } else if (material.name === GLASS_MATERIAL) {
    // Translucent liquid that glows, so the lamp reads as lit (and blooms) even in the dark room.
    material.color.set(GLASS_COLOR)
    material.emissive.set(GLASS_COLOR)
    material.emissiveIntensity = 0.9
    material.transparent = true
    material.opacity = 0.72
    material.roughness = 0.15
    material.depthWrite = false
  } else if (material.name === METAL_MATERIAL) {
    material.color.set('#2b2f3a')
    material.metalness = 0.8
    material.roughness = 0.35
  }
}

type LavaLampProps = {
  /** Real light washing the shelf and walls (off on mobile). */
  glow: boolean
}

/** Lava lamp on the shelf: glowing red glass with slowly rising and sinking wax blobs. */
function LavaLamp({ glow }: LavaLampProps) {
  const animate = useAnimationsEnabled()
  const getTime = useIntroTime()
  const blobs = useRef<(THREE.Mesh | null)[]>([])
  const light = useRef<THREE.PointLight>(null)
  const waxMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: WAX_COLOR, emissive: WAX_COLOR, emissiveIntensity: 1.4, roughness: 0.4 }),
    [],
  )
  useEffect(() => () => waxMaterial.dispose(), [waxMaterial])

  useFrame((state) => {
    const t = animate ? state.clock.elapsedTime : 0
    const travel = GLASS_TOP - GLASS_BOTTOM
    BLOBS.forEach(([size, speed, phase], i) => {
      const blob = blobs.current[i]
      if (!blob) return
      const r = size * GLASS_RADIUS * 0.8
      // Rise and sink between the bottom and top of the glass, slowing at the ends like warm wax.
      const p = 0.5 - 0.5 * Math.cos(t * speed * Math.PI * 2 + phase)
      blob.position.set(
        Math.sin(t * 0.3 + phase) * (GLASS_RADIUS - r) * 0.35,
        GLASS_BOTTOM + r + p * (travel - 2 * r),
        Math.cos(t * 0.25 + phase) * (GLASS_RADIUS - r) * 0.35,
      )
      // Stretch while moving fastest (mid-travel).
      const stretch = 1 + Math.sin(p * Math.PI) * 0.35
      blob.scale.set(r / stretch ** 0.5, r * stretch, r / stretch ** 0.5)
    })
    if (light.current) light.current.intensity = GLOW_INTENSITY * lightLevel(getTime())
  })

  return (
    <group position={LAVA_LAMP.position}>
      <FittedModel url={MODEL_URL} fit={{ axis: 'y', size: LAVA_LAMP.height }} prepareMaterial={prepareLampMaterial} />
      {BLOBS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            blobs.current[i] = el
          }}
          material={waxMaterial}
        >
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      ))}
      {glow && (
        <pointLight
          ref={light}
          position={[0.15, (GLASS_BOTTOM + GLASS_TOP) / 2, 0.15]}
          intensity={0}
          distance={3}
          color={LIGHT_COLOR}
        />
      )}
    </group>
  )
}

export default LavaLamp
