import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SKY_PANEL } from './roomLayout.ts'

// A thin cloud drifting across the sky, passing in front of the moon.
const WIDTH = 1.8
const HEIGHT = 0.55
const Y = 4.0
const SPEED = 0.04 // world units per second; about 2.5 minutes per pass
const START_X = SKY_PANEL.maxX + WIDTH / 2
const END_X = SKY_PANEL.minX - WIDTH / 2
// Where the cloud sits when animations are off (just clear of the moon).
const STATIC_X = 0.6

function createCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 80
  const ctx = canvas.getContext('2d')!
  // A few overlapping soft puffs.
  const puffs: [number, number, number][] = [
    [60, 46, 30],
    [105, 38, 36],
    [150, 44, 32],
    [195, 48, 26],
    [128, 52, 40],
  ]
  for (const [x, y, r] of puffs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255, 255, 255, 0.55)')
    g.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

type WindowCloudProps = {
  animate: boolean
}

function WindowCloud({ animate }: WindowCloudProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createCloudTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  useFrame((state) => {
    if (!mesh.current || !animate) return
    const span = START_X - END_X
    // Start partway across so the cloud is visible soon after load.
    const travelled = (state.clock.elapsedTime * SPEED + span * 0.35) % span
    mesh.current.position.x = START_X - travelled
  })

  return (
    <mesh ref={mesh} position={[STATIC_X, Y, SKY_PANEL.z + 0.02]}>
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <meshBasicMaterial map={texture} color="#8f9ccc" transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

export default WindowCloud
