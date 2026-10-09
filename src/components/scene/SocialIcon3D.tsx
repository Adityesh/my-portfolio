import { RoundedBox, useCursor } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import type { Social } from '../../data/socials.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useQuality } from '../../hooks/useQuality.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { INTRO, lightLevel, useAnimationsEnabled, useIntroTime } from './introTimeline.ts'
import { useInteractive } from './useInteractive.ts'

// Neon sign on the wall: a dark backing panel with the extruded logo glowing in front of it.
const LOGO_SIZE = 0.72
const LOGO_DEPTH = 0.05
const PANEL_SIZE = 0.96
const PANEL_DEPTH = 0.04
// Logo brightness (unlit, not tone mapped, so values above 1 bloom).
const BRIGHTNESS = 1.6
const HOVER_BRIGHTNESS = 2.8
const HOVER_SCALE = 1.08
// Idle pulse as a "tap me" hint: stronger on touch devices where there is no hover.
const PULSE = 0.12
const PULSE_TOUCH = 0.35
const PULSE_SPEED = 2.2
const GLOW_INTENSITY = 1.6
const GLOW_HOVER_INTENSITY = 3
const CLICK_TOLERANCE = 6
const HIT_PADDING_TOUCH = 1.5

function createLogoGeometry(iconPath: string): THREE.ExtrudeGeometry {
  const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${iconPath}"/></svg>`)
  const shapes = svg.paths.flatMap((path) => path.toShapes())
  const geometry = new THREE.ExtrudeGeometry(shapes, { depth: LOGO_DEPTH * (24 / LOGO_SIZE), bevelEnabled: false })
  // SVG y points down; flip it, centre the logo and scale the 24-unit viewBox to LOGO_SIZE.
  geometry.center()
  geometry.scale(LOGO_SIZE / 24, -LOGO_SIZE / 24, LOGO_SIZE / 24)
  return geometry
}

type SocialIcon3DProps = {
  social: Social
}

function SocialIcon3D({ social }: SocialIcon3DProps) {
  const isMobile = useIsMobile()
  const { config } = useQuality()
  const animate = useAnimationsEnabled()
  const getTime = useIntroTime()
  const invalidate = useThree((state) => state.invalidate)
  const active = useAppStore((state) => state.view === 'room' && !state.transitioning)
  const [hovered, setHovered] = useState(false)
  useCursor(active && hovered)

  const geometry = useMemo(() => createLogoGeometry(social.iconPath), [social.iconPath])
  useEffect(() => () => geometry.dispose(), [geometry])

  const group = useRef<THREE.Group>(null)
  const logoMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const glow = useRef<THREE.PointLight>(null)
  const baseColor = useMemo(() => new THREE.Color(social.color), [social.color])

  useFrame((state, delta) => {
    const t = getTime()
    const on = lightLevel(t)
    const isHovered = hovered && active
    const pulseAmount = isMobile ? PULSE_TOUCH : PULSE
    const pulse = animate && !isHovered && t > INTRO.total ? 1 + Math.sin(state.clock.elapsedTime * PULSE_SPEED) * pulseAmount : 1
    const brightness = (isHovered ? HOVER_BRIGHTNESS : BRIGHTNESS) * pulse * on

    logoMaterial.current?.color.copy(baseColor).multiplyScalar(brightness)
    if (glow.current) glow.current.intensity = (isHovered ? GLOW_HOVER_INTENSITY : GLOW_INTENSITY) * on
    if (group.current) {
      const target = isHovered ? HOVER_SCALE : 1
      const s = THREE.MathUtils.damp(group.current.scale.x, target, 12, delta)
      group.current.scale.setScalar(s)
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!active || e.delta > CLICK_TOLERANCE) return
    e.stopPropagation()
    window.open(social.url, '_blank', 'noopener,noreferrer')
  }

  // Hover label only: SocialLinks has the real links for keyboard and screen readers.
  const [sx, sy, sz] = social.position
  const markHover = useInteractive(
    {
      id: `social-${social.id}`,
      name: social.label,
      action: 'Open profile',
      anchor: [sx, sy + PANEL_SIZE / 2 + 0.25, sz],
      keyboard: false,
      order: 0,
    },
    () => window.open(social.url, '_blank', 'noopener,noreferrer'),
  )

  const setHover = (value: boolean) => {
    setHovered(value)
    markHover(value)
    invalidate()
  }

  const hitSize = PANEL_SIZE * (isMobile ? HIT_PADDING_TOUCH : 1)

  return (
    <group position={social.position}>
      <group ref={group}>
        {/* Backing panel, just off the wall. */}
        <RoundedBox args={[PANEL_SIZE, PANEL_SIZE, PANEL_DEPTH]} radius={0.05} position={[0, 0, PANEL_DEPTH / 2 + 0.01]}>
          <meshStandardMaterial color="#0b0f1e" roughness={0.4} metalness={0.2} />
        </RoundedBox>
        <mesh geometry={geometry} position={[0, 0, PANEL_DEPTH + 0.02]}>
          <meshBasicMaterial ref={logoMaterial} color="#000000" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Coloured glow on the wall and bed (higher quality levels; the logo itself always glows). */}
      {config.fullLights && <pointLight ref={glow} position={[0, 0, 0.45]} intensity={0} distance={3} color={social.color} />}

      {/* Invisible hit area (larger on touch devices). */}
      <mesh
        position={[0, 0, PANEL_DEPTH + 0.1]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => setHover(false)}
      >
        <planeGeometry args={[hitSize, hitSize]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default SocialIcon3D
