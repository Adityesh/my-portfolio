import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { playBloop } from '../../audio/sfx.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import FittedModel from './FittedModel.tsx'
import { lightLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { LAVA_LAMP } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

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

// Colour themes, cycled by tapping the lamp (the first is the default).
const THEMES = [
  { glass: '#ff2418', wax: '#ff7a3d', light: '#ff3b2f' },
  { glass: '#1e6bff', wax: '#4fe3ff', light: '#2f7dff' },
  { glass: '#22c93a', wax: '#d8ff4a', light: '#3cff5a' },
  { glass: '#9b2cff', wax: '#ff5ad1', light: '#a64dff' },
].map((theme) => ({ glass: new THREE.Color(theme.glass), wax: new THREE.Color(theme.wax), light: new THREE.Color(theme.light) }))
const GLOW_INTENSITY = 2.4
// How quickly the colours blend to a new theme (damping rate; ~0.5 s).
const THEME_FADE = 6
// A tap warms the wax up: blobs move this many times faster, easing back to normal over `seconds`.
const BOIL = { speed: 3, seconds: 3 }
// Hit box around the lamp (it's ~0.5 wide at the base); bigger on touch devices.
const HIT_SIZE: [number, number, number] = [0.42, LAVA_LAMP.height * 1.05, 0.42]
const HIT_PADDING_TOUCH = 1.4

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
    material.color.copy(THEMES[0].glass)
    material.emissive.copy(THEMES[0].glass)
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

/** Lava lamp on the shelf: glowing glass with slowly rising and sinking wax blobs. Tap to change its colour. */
function LavaLamp({ glow }: LavaLampProps) {
  const animate = useAnimationsEnabled()
  const getTime = useIntroTime()
  const isMobile = useIsMobile()
  const sound = useSettingsStore((state) => state.sound)
  const lamp = useRef<THREE.Group>(null)
  const blobs = useRef<(THREE.Mesh | null)[]>([])
  const light = useRef<THREE.PointLight>(null)
  const glassMaterial = useRef<THREE.MeshStandardMaterial | null>(null)
  const waxMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: THEMES[0].wax, emissive: THEMES[0].wax, emissiveIntensity: 1.4, roughness: 0.4 }),
    [],
  )
  useEffect(() => () => waxMaterial.dispose(), [waxMaterial])

  const theme = useRef(0)
  // Blob clock: runs faster for a while after a tap.
  const blobTime = useRef(0)
  const boilStart = useRef(-Infinity)

  const { bind } = useTapTarget(() => {
    theme.current = (theme.current + 1) % THEMES.length
    boilStart.current = performance.now() / 1000
    if (sound) playBloop(THREE.MathUtils.randFloat(0.9, 1.15))
  })

  useFrame((_, delta) => {
    // The glass material lives in the (cloned) model; find it once it has loaded.
    if (!glassMaterial.current && lamp.current) {
      lamp.current.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (mesh.isMesh && (mesh.material as THREE.Material).name === GLASS_MATERIAL) {
          glassMaterial.current = mesh.material as THREE.MeshStandardMaterial
        }
      })
    }

    // Blend toward the current theme (instantly with animations off).
    const target = THEMES[theme.current]
    const k = animate ? 1 - Math.exp(-THEME_FADE * delta) : 1
    waxMaterial.color.lerp(target.wax, k)
    waxMaterial.emissive.lerp(target.wax, k)
    if (glassMaterial.current) {
      glassMaterial.current.color.lerp(target.glass, k)
      glassMaterial.current.emissive.lerp(target.glass, k)
    }
    if (light.current) {
      light.current.color.lerp(target.light, k)
      light.current.intensity = GLOW_INTENSITY * lightLevel(getTime())
    }

    const since = performance.now() / 1000 - boilStart.current
    const boil = since < BOIL.seconds ? 1 - since / BOIL.seconds : 0
    if (animate) blobTime.current += delta * (1 + (BOIL.speed - 1) * boil)
    const t = blobTime.current
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
  })

  const hitScale = isMobile ? HIT_PADDING_TOUCH : 1

  return (
    <group ref={lamp} position={LAVA_LAMP.position}>
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
          color={THEMES[0].light}
        />
      )}

      {/* Invisible hit box. */}
      <mesh position={[0, HIT_SIZE[1] / 2, 0]} {...bind}>
        <boxGeometry args={[HIT_SIZE[0] * hitScale, HIT_SIZE[1], HIT_SIZE[2] * hitScale]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default LavaLamp
