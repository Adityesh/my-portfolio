import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

// Marker drawing on the whiteboard: a little architecture sketch and a to-do list.
const WIDTH = 1024
const HEIGHT = 720
const HAND = '"Segoe Print", "Bradley Hand", "Comic Sans MS", "Chalkboard SE", cursive'
const MARKER = { blue: '#1d4ed8', red: '#dc2626', green: '#15803d', black: '#1f2937' }

function createDrawingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const box = (x: number, y: number, w: number, h: number, label: string, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(x + 4, y)
    ctx.lineTo(x + w, y + 3)
    ctx.lineTo(x + w - 2, y + h)
    ctx.lineTo(x, y + h - 3)
    ctx.closePath()
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = `600 38px ${HAND}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x + w / 2, y + h / 2)
  }
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo((x1 + x2) / 2, y1 - 14, x2, y2)
    ctx.stroke()
    const a = Math.atan2(y2 - y1, x2 - x1)
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - 22 * Math.cos(a - 0.5), y2 - 22 * Math.sin(a - 0.5))
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - 22 * Math.cos(a + 0.5), y2 - 22 * Math.sin(a + 0.5))
    ctx.stroke()
  }

  // Architecture sketch.
  box(60, 80, 230, 110, 'React', MARKER.blue)
  box(400, 80, 230, 110, 'API', MARKER.blue)
  box(740, 80, 230, 110, 'DB', MARKER.blue)
  arrow(300, 135, 390, 135, MARKER.black)
  arrow(640, 135, 730, 135, MARKER.black)

  // To-do list.
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = MARKER.black
  ctx.font = `700 46px ${HAND}`
  ctx.fillText('TODO', 70, 300)
  ctx.font = `500 38px ${HAND}`
  const items: [string, boolean][] = [
    ['build portfolio', true],
    ['add 3D room', true],
    ['ship it', false],
  ]
  items.forEach(([label, done], i) => {
    const y = 370 + i * 70
    ctx.strokeStyle = done ? MARKER.green : MARKER.black
    ctx.lineWidth = 5
    ctx.strokeRect(75, y - 32, 34, 34)
    if (done) {
      ctx.beginPath()
      ctx.moveTo(80, y - 16)
      ctx.lineTo(92, y - 2)
      ctx.lineTo(116, y - 42)
      ctx.stroke()
    }
    ctx.fillStyle = MARKER.black
    ctx.fillText(label, 135, y)
  })

  // A doodle in the corner.
  ctx.fillStyle = MARKER.red
  ctx.font = `700 64px ${HAND}`
  ctx.textAlign = 'center'
  ctx.fillText('</>', 790, 470)
  ctx.strokeStyle = MARKER.red
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.ellipse(790, 450, 120, 80, -0.1, 0, Math.PI * 2)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

type WhiteboardDrawingProps = {
  width: number
  height: number
}

/** Transparent plane with marker drawings; faces +x. */
function WhiteboardDrawing({ width, height }: WhiteboardDrawingProps) {
  const texture = useMemo(() => createDrawingTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} transparent roughness={0.6} depthWrite={false} />
    </mesh>
  )
}

export default WhiteboardDrawing
