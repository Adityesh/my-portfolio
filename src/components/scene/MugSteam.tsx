import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// A few soft puffs rising from the mug and fading out, staggered so the steam looks continuous.
const PUFFS = 3
const RISE = 0.35
const CYCLE_SECONDS = 3.2
const SIZE = 0.16
const OPACITY = 0.22

function createPuffTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

type MugSteamProps = {
  /** Height of the mug rim above the group origin. */
  rimHeight: number
}

function MugSteam({ rimHeight }: MugSteamProps) {
  const texture = useMemo(() => createPuffTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])
  const puffs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    puffs.current.forEach((puff, i) => {
      if (!puff) return
      const p = ((t / CYCLE_SECONDS + i / PUFFS) % 1 + 1) % 1
      puff.position.set(Math.sin(t * 1.3 + i * 2) * 0.02, rimHeight + p * RISE, 0)
      puff.scale.setScalar(SIZE * (0.6 + p))
      const material = puff.material as THREE.MeshBasicMaterial
      material.opacity = OPACITY * Math.sin(Math.PI * p)
    })
  })

  return (
    <>
      {Array.from({ length: PUFFS }, (_, i) => (
        <Billboard key={i}>
          <mesh
            ref={(el) => {
              puffs.current[i] = el
            }}
          >
            <planeGeometry />
            <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={0} color="#dfe6f5" />
          </mesh>
        </Billboard>
      ))}
    </>
  )
}

export default MugSteam
