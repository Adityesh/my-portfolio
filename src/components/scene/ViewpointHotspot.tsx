import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import type { PovViewpoint } from '../../store/viewpoints.ts'
import { INTRO, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { VIEWPOINT_POSES } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

// A small glowing marker floating where a first-person viewpoint is (room view only): tap it to step in.
const SIZE = 0.34
const COLOR = '#9fe8ff'
// Unlit, not tone mapped: above 1 catches a little bloom.
const BRIGHTNESS = 1.3
const HOVER_BRIGHTNESS = 2.2
const HOVER_SCALE = 1.25
// Gentle breathing so it reads as interactive (stronger on touch devices, where there's no hover).
const PULSE = { amount: 0.12, touch: 0.22, speed: 2 }
// Fades in once the intro has finished.
const FADE_IN_SECONDS = 0.8
// Hit circle relative to the marker; bigger on touch devices.
const HIT_PADDING = 0.6
const HIT_PADDING_TOUCH = 0.9

/** Ring with a soft glow and a centre dot (white; tinted by the material colour). */
function createMarkerTexture(): THREE.CanvasTexture {
  const size = 128
  const c = size / 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c)
  glow.addColorStop(0, 'rgba(255,255,255,0.35)')
  glow.addColorStop(0.55, 'rgba(255,255,255,0.12)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.arc(c, c, size * 0.3, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(c, c, size * 0.1, 0, Math.PI * 2)
  ctx.fill()
  return new THREE.CanvasTexture(canvas)
}

type ViewpointHotspotProps = {
  viewpoint: PovViewpoint
}

function ViewpointHotspot({ viewpoint }: ViewpointHotspotProps) {
  const isMobile = useIsMobile()
  const animate = useAnimationsEnabled()
  const getTime = useIntroTime()
  const goToViewpoint = useAppStore((state) => state.goToViewpoint)
  const { hovered, bind } = useTapTarget(() => goToViewpoint(viewpoint))

  const texture = useMemo(() => createMarkerTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])
  const base = useMemo(() => new THREE.Color(COLOR), [])
  const marker = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state, delta) => {
    const t = getTime()
    const fade = THREE.MathUtils.clamp((t - INTRO.total) / FADE_IN_SECONDS, 0, 1)
    const pulseAmount = isMobile ? PULSE.touch : PULSE.amount
    const pulse = animate && !hovered ? 1 + Math.sin(state.clock.elapsedTime * PULSE.speed) * pulseAmount : 1
    if (material.current) {
      material.current.color.copy(base).multiplyScalar((hovered ? HOVER_BRIGHTNESS : BRIGHTNESS) * pulse)
      material.current.opacity = fade
    }
    if (marker.current) {
      const target = SIZE * (hovered ? HOVER_SCALE : 1)
      marker.current.scale.setScalar(THREE.MathUtils.damp(marker.current.scale.x, target, 14, delta))
    }
  })

  const hit = SIZE * (isMobile ? HIT_PADDING_TOUCH : HIT_PADDING)

  return (
    <Billboard position={VIEWPOINT_POSES[viewpoint].hotspot}>
      <group ref={marker} scale={SIZE}>
        {/* Drawn over everything: the markers sit inside the room and furniture (the chair back) would hide some. */}
        <mesh renderOrder={10}>
          <planeGeometry />
          <meshBasicMaterial
            ref={material}
            map={texture}
            transparent
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            opacity={0}
          />
        </mesh>
      </group>
      {/* Invisible hit circle facing the camera. */}
      <mesh {...bind}>
        <circleGeometry args={[hit, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </Billboard>
  )
}

export default ViewpointHotspot
