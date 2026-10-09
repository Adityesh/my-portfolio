import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

// Little symbols that pop in and float up: hearts from the cat, music notes from the headphones, sparkles from
// the watered plant.
const MAX_SYMBOLS = 6
const SIZE = 0.16
const SWAY = 0.04
// Above 1 so the symbols catch a little bloom (the material is not tone mapped).
const BRIGHTNESS = 1.4

/** A symbol to show: when it starts (seconds, performance.now based; may be in the future) and its sideways offset. */
export type SymbolBurst = { start: number; offsetX: number }
export type SymbolShape = 'heart' | 'note' | 'sparkle'

function drawHeart(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath()
  ctx.moveTo(32, 56)
  ctx.bezierCurveTo(4, 36, 4, 10, 20, 10)
  ctx.bezierCurveTo(27, 10, 31, 15, 32, 20)
  ctx.bezierCurveTo(33, 15, 37, 10, 44, 10)
  ctx.bezierCurveTo(60, 10, 60, 36, 32, 56)
  ctx.fill()
}

/** Eighth note: a tilted oval head, a stem and a curved flag. */
function drawNote(ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.translate(24, 47)
  ctx.rotate(-0.4)
  ctx.beginPath()
  ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.fillRect(31, 10, 4, 37)
  ctx.beginPath()
  ctx.moveTo(35, 10)
  ctx.bezierCurveTo(46, 14, 52, 22, 46, 34)
  ctx.bezierCurveTo(47, 26, 42, 21, 35, 20)
  ctx.closePath()
  ctx.fill()
}

/** Four-pointed twinkle with a soft glow. */
function drawSparkle(ctx: CanvasRenderingContext2D): void {
  const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
  glow.addColorStop(0, 'rgba(255,255,255,0.5)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 64, 64)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(32, 4)
  ctx.quadraticCurveTo(35, 29, 60, 32)
  ctx.quadraticCurveTo(35, 35, 32, 60)
  ctx.quadraticCurveTo(29, 35, 4, 32)
  ctx.quadraticCurveTo(29, 29, 32, 4)
  ctx.fill()
}

function createTexture(shape: SymbolShape): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  if (shape === 'heart') drawHeart(ctx)
  else if (shape === 'note') drawNote(ctx)
  else drawSparkle(ctx)
  return new THREE.CanvasTexture(canvas)
}

type FloatingSymbolsProps = {
  shape: SymbolShape
  color: string
  /** Pushed to by the owner; expired bursts are dropped here. */
  bursts: RefObject<SymbolBurst[]>
  /** Where the symbols start, in the parent's frame. */
  origin: [number, number, number]
  /** Seconds each symbol lives. */
  duration: number
  /** How far they float up over their life. */
  rise: number
  /** Rise and sway; without it the symbols just fade in place. */
  animate: boolean
}

function FloatingSymbols({ shape, color, bursts, origin, duration, rise, animate }: FloatingSymbolsProps) {
  const texture = useMemo(() => createTexture(shape), [shape])
  useEffect(() => () => texture.dispose(), [texture])
  // The billboard groups themselves are moved (moving a child inside one would rotate the offset with it).
  const symbols = useRef<(THREE.Group | null)[]>([])
  const materials = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const tint = useMemo(() => new THREE.Color(color).multiplyScalar(BRIGHTNESS), [color])

  useFrame(() => {
    const now = performance.now() / 1000
    const active = bursts.current.filter((burst) => now - burst.start < duration).slice(-MAX_SYMBOLS)
    bursts.current = active
    symbols.current.forEach((symbol, i) => {
      if (!symbol) return
      const burst = active[i]
      const p = burst ? (now - burst.start) / duration : -1
      // Bursts scheduled a moment ahead (staggered) stay hidden until they start.
      symbol.visible = p >= 0
      if (!burst || p < 0) return
      const sway = animate ? Math.sin(p * Math.PI * 2 + burst.offsetX * 40) * SWAY : 0
      symbol.position.set(origin[0] + burst.offsetX + sway, origin[1] + (animate ? p * rise : 0), origin[2])
      // Pops in, then shrinks a little as it fades.
      symbol.scale.setScalar(SIZE * (p < 0.15 ? p / 0.15 : 1 - (p - 0.15) * 0.3))
      const material = materials.current[i]
      if (material) material.opacity = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4
    })
  })

  return (
    <>
      {Array.from({ length: MAX_SYMBOLS }, (_, i) => (
        <Billboard
          key={i}
          visible={false}
          ref={(el) => {
            symbols.current[i] = el
          }}
        >
          <mesh>
            <planeGeometry />
            <meshBasicMaterial
              ref={(el) => {
                materials.current[i] = el
              }}
              map={texture}
              color={tint}
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

export default FloatingSymbols
