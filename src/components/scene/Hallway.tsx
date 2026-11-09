import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { doorMotion } from './doorMotion.ts'
import { HALLWAY } from './roomLayout.ts'

// What you see through the open door: a warm glow filling the doorway (the lit hallway beyond, implied rather than
// drawn), and warm light spilling into the dark room. The light is always mounted (at 0 while the door is shut) so
// opening the door never changes the light count and recompiles shaders.
const SPILL = { color: '#ffcf9a', intensity: 10, distance: 7 }
// Glow brightness (unlit, not tone mapped: above 1 so it blooms). Its colour comes from the texture.
const GLOW_BRIGHTNESS = 2.5
// Follows how far the door is actually open (doorMotion), reaching zero while it's still this much open, so nothing
// glows around a door that's (nearly) shut.
const SHUT_BELOW = 0.12
const TEXTURE = { width: 128, height: 256 }

const WIDTH = HALLWAY.maxZ - HALLWAY.minZ
const HEIGHT = HALLWAY.maxY - HALLWAY.minY

/** Bright warm white at the centre, deepening to amber toward the edges of the doorway. */
function createGlowTexture(): THREE.CanvasTexture {
  const { width: w, height: h } = TEXTURE
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#e8903c'
  ctx.fillRect(0, 0, w, h)
  // Stretched radial glow: centre slightly above middle (where a hallway light would be).
  ctx.save()
  ctx.translate(w / 2, h * 0.42)
  ctx.scale(1, h / w)
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.75)
  glow.addColorStop(0, '#fff6e6')
  glow.addColorStop(0.35, '#ffd9a3')
  glow.addColorStop(0.75, '#f5a85a')
  glow.addColorStop(1, '#e8903c')
  ctx.fillStyle = glow
  ctx.fillRect(-w, -w, w * 2, w * 2)
  ctx.restore()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** The glow beyond the door, and its light spilling in while the door is open. */
function Hallway() {
  const texture = useMemo(() => createGlowTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])
  const backdrop = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const light = useRef<THREE.PointLight>(null)
  const shown = useRef(-1)

  // Door.tsx keeps frames coming while the door moves; this just mirrors its opening.
  useFrame(() => {
    const open = THREE.MathUtils.clamp((doorMotion.level - SHUT_BELOW) / (1 - SHUT_BELOW), 0, 1)
    const k = open * open * (3 - 2 * open)
    if (k === shown.current) return
    shown.current = k
    if (light.current) light.current.intensity = SPILL.intensity * k
    if (material.current) material.current.color.setScalar(GLOW_BRIGHTNESS * k)
    if (backdrop.current) backdrop.current.visible = k > 0
  })

  return (
    <>
      {/* Faces +x, into the room, on the back of the doorway recess. */}
      <mesh
        ref={backdrop}
        visible={false}
        position={[HALLWAY.x, (HALLWAY.minY + HALLWAY.maxY) / 2, (HALLWAY.minZ + HALLWAY.maxZ) / 2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshBasicMaterial ref={material} map={texture} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={HALLWAY.light} intensity={0} distance={SPILL.distance} color={SPILL.color} />
    </>
  )
}

export default Hallway
