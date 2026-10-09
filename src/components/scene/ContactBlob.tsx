import type { ThreeElements } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

// Darkest at the centre, fading to nothing at the rim; the falloff keeps most of the darkness near the middle.
const TEXTURE_SIZE = 64

function createBlobTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_SIZE
  canvas.height = TEXTURE_SIZE
  const ctx = canvas.getContext('2d')!
  const r = TEXTURE_SIZE / 2
  const g = ctx.createRadialGradient(r, r, 0, r, r, r)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(0.5, 'rgba(0,0,0,0.6)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
  return new THREE.CanvasTexture(canvas)
}

type ContactBlobProps = Omit<ThreeElements['mesh'], 'children'> & {
  /** Footprint as [width along x, length along z]. */
  size: [number, number]
  opacity: number
}

/** Soft dark patch lying flat under an object that casts no real shadow, so it looks like it rests on the surface. */
function ContactBlob({ size, opacity, ...meshProps }: ContactBlobProps) {
  const texture = useMemo(() => createBlobTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[size[0], size[1], 1]} {...meshProps}>
      <planeGeometry />
      <meshBasicMaterial map={texture} color="#000000" transparent depthWrite={false} opacity={opacity} />
    </mesh>
  )
}

export default ContactBlob
