import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

// Little hearts that float up from the cat when it's tapped.
const MAX_HEARTS = 6
const DURATION = 1.4
const RISE = 0.45
const SIZE = 0.16
const SWAY = 0.04
const COLOR = '#ff7aa8'
// Above 1 so the hearts catch a little bloom (the material is not tone mapped).
const BRIGHTNESS = 1.4

/** A heart to show: when it started (seconds, performance.now based) and its sideways offset. */
export type HeartBurst = { start: number; offsetX: number }

function createHeartTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(32, 56)
  ctx.bezierCurveTo(4, 36, 4, 10, 20, 10)
  ctx.bezierCurveTo(27, 10, 31, 15, 32, 20)
  ctx.bezierCurveTo(33, 15, 37, 10, 44, 10)
  ctx.bezierCurveTo(60, 10, 60, 36, 32, 56)
  ctx.fill()
  return new THREE.CanvasTexture(canvas)
}

type CatHeartsProps = {
  /** Shared with the cat, which pushes a burst on each tap; expired bursts are dropped here. */
  bursts: RefObject<HeartBurst[]>
  /** Where the hearts start, in the parent's frame. */
  origin: [number, number, number]
  /** Rise and sway; without it the hearts just fade in place. */
  animate: boolean
}

function CatHearts({ bursts, origin, animate }: CatHeartsProps) {
  const texture = useMemo(() => createHeartTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])
  // The billboard groups themselves are moved (moving a child inside one would rotate the offset with it).
  const hearts = useRef<(THREE.Group | null)[]>([])
  const materials = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const color = useMemo(() => new THREE.Color(COLOR).multiplyScalar(BRIGHTNESS), [])

  useFrame(() => {
    const now = performance.now() / 1000
    const active = bursts.current.filter((burst) => now - burst.start < DURATION).slice(-MAX_HEARTS)
    bursts.current = active
    hearts.current.forEach((heart, i) => {
      if (!heart) return
      const burst = active[i]
      heart.visible = burst !== undefined
      if (!burst) return
      const p = (now - burst.start) / DURATION
      const sway = animate ? Math.sin(p * Math.PI * 2 + burst.offsetX * 40) * SWAY : 0
      heart.position.set(origin[0] + burst.offsetX + sway, origin[1] + (animate ? p * RISE : 0), origin[2])
      // Pops in, then shrinks a little as it fades.
      heart.scale.setScalar(SIZE * (p < 0.15 ? p / 0.15 : 1 - (p - 0.15) * 0.3))
      const material = materials.current[i]
      if (material) material.opacity = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4
    })
  })

  return (
    <>
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <Billboard
          key={i}
          visible={false}
          ref={(el) => {
            hearts.current[i] = el
          }}
        >
          <mesh>
            <planeGeometry />
            <meshBasicMaterial
              ref={(el) => {
                materials.current[i] = el
              }}
              map={texture}
              color={color}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      ))}
    </>
  )
}

export default CatHearts
