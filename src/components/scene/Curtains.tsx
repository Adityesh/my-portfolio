import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { playSwish } from '../../audio/sfx.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { DRACO_PATH } from './assetPaths.ts'
import { useAnimationsEnabled } from './introTimeline.ts'
import { CURTAIN_DAMPING, SHELF, WINDOW } from './roomLayout.ts'
import { useTapTarget } from './useTapTarget.ts'

const MODEL_URL = '/models/curtains.glb'
// Each panel's size on the wall, and how far it reaches over the window opening.
// Kept narrow so the left panel clears the shelf and the right one clears the social signs.
const PANEL_WIDTH = 0.7
const OVERLAP = 0.55
const TOP_Y = WINDOW.maxY + 0.3
const BOTTOM_Y = WINDOW.minY - 0.2
const DEPTH = 0.12
const Z = WINDOW.insideZ + 0.1
const ROD_Y = TOP_Y + 0.04
// Breeze from the open window: how much deeper the folds get, how far the fabric drifts into the room and sways
// sideways (world units), the gust speed, and how quickly it eases in/out.
const BREEZE = { depth: 0.9, drift: 0.07, sway: 0.02, speed: 1.6, ease: 1.5 }
// The model's texture is nearly black and read as a shadow in the dim room; use a light linen instead.
const FABRIC_COLOR = '#d6c6a8'

type GLTFResult = GLTF & {
  nodes: { Curtains: THREE.Mesh }
}

/** Splits the model (two panels with a gap between them) into separate left and right geometries. */
function splitPanels(source: THREE.BufferGeometry): [THREE.BufferGeometry, THREE.BufferGeometry] {
  const flat = source.index ? source.toNonIndexed() : source.clone()
  const position = flat.getAttribute('position')
  const names = Object.keys(flat.attributes)
  const left: Record<string, number[]> = {}
  const right: Record<string, number[]> = {}
  for (const name of names) {
    left[name] = []
    right[name] = []
  }
  for (let tri = 0; tri < position.count; tri += 3) {
    const x0 = position.getX(tri)
    const x1 = position.getX(tri + 1)
    const x2 = position.getX(tri + 2)
    // The model's own rod runs across the top between the panels; skip it (we draw our own). Left in, it widened
    // the left panel's bounds to the whole model, which squashed that panel to a third of its width.
    if (Math.min(x0, x1, x2) < 0 && Math.max(x0, x1, x2) > 0) continue
    const cx = (x0 + x1 + x2) / 3
    const target = cx < 0 ? left : right
    for (const name of names) {
      const attr = flat.getAttribute(name)
      for (let v = tri; v < tri + 3; v++) for (let c = 0; c < attr.itemSize; c++) target[name].push(attr.getComponent(v, c))
    }
  }
  flat.dispose()
  const build = (data: Record<string, number[]>) => {
    const g = new THREE.BufferGeometry()
    for (const name of names) g.setAttribute(name, new THREE.Float32BufferAttribute(data[name], source.getAttribute(name).itemSize))
    g.computeBoundingBox()
    return g
  }
  return [build(left), build(right)]
}

// Open, each panel is gathered at its side of the window. Drawn, the inner edges meet just past the middle (a little
// overlap so no light shows through) while the outer edges stay put, so the fabric widens and unfolds as it closes.
// The left panel's outer edge stops just short of the shelf's end (the shelf sticks out past the curtain plane).
const LEFT_OUTER_X = Math.max(WINDOW.minX + OVERLAP - PANEL_WIDTH, SHELF.maxX + 0.03)
const RIGHT_OUTER_X = WINDOW.maxX - OVERLAP + PANEL_WIDTH
const LEFT_OPEN_INNER_X = WINDOW.minX + OVERLAP
const RIGHT_OPEN_INNER_X = WINDOW.maxX - OVERLAP
const MID_X = (WINDOW.minX + WINDOW.maxX) / 2
const CLOSED_OVERLAP = 0.04

/** Sets a panel mesh's scale and position so it spans [minX, minX + width] and the full drop. */
function placePanel(mesh: THREE.Mesh, minX: number, width: number): void {
  const geometry = mesh.geometry
  const box = geometry.boundingBox!
  const sx = width / (box.max.x - box.min.x)
  const sy = (TOP_Y - BOTTOM_Y) / (box.max.y - box.min.y)
  const sz = DEPTH / (box.max.z - box.min.z)
  mesh.scale.set(sx, sy, sz)
  mesh.position.set(minX - box.min.x * sx, BOTTOM_Y - box.min.y * sy, Z - ((box.min.z + box.max.z) / 2) * sz)
}

/** Curtain panels framing the window, plus a rod. Tap a panel to draw or open them. */
function Curtains() {
  const { nodes } = useGLTF(MODEL_URL, DRACO_PATH) as unknown as GLTFResult
  const [left, right] = useMemo(() => splitPanels(nodes.Curtains.geometry), [nodes])
  const fabric = useMemo(() => new THREE.MeshStandardMaterial({ color: FABRIC_COLOR, roughness: 1, side: THREE.DoubleSide }), [])
  useEffect(
    () => () => {
      left.dispose()
      right.dispose()
      fabric.dispose()
    },
    [left, right, fabric],
  )

  const animate = useAnimationsEnabled()
  const invalidate = useThree((state) => state.invalidate)
  const closed = useAppStore((state) => state.curtainsClosed)
  const setClosed = useAppStore((state) => state.setCurtainsClosed)
  const sound = useSettingsStore((state) => state.sound)
  const { bind } = useTapTarget(
    () => {
      setClosed(!closed)
      if (sound) playSwish(!closed)
    },
    {
      id: 'curtains',
      name: 'Curtains',
      action: closed ? 'Open' : 'Draw',
      anchor: [(WINDOW.minX + WINDOW.maxX) / 2, TOP_Y + 0.35, Z],
      order: 4,
    },
  )

  const leftPanel = useRef<THREE.Mesh>(null)
  const rightPanel = useRef<THREE.Mesh>(null)
  // 0 = open, 1 = drawn; eases at the same rate as the window light in Lights.tsx.
  const level = useRef(closed ? 1 : 0)

  const place = (k: number) => {
    const leftInner = THREE.MathUtils.lerp(LEFT_OPEN_INNER_X, MID_X + CLOSED_OVERLAP, k)
    const rightInner = THREE.MathUtils.lerp(RIGHT_OPEN_INNER_X, MID_X - CLOSED_OVERLAP, k)
    if (leftPanel.current) placePanel(leftPanel.current, LEFT_OUTER_X, leftInner - LEFT_OUTER_X)
    if (rightPanel.current) placePanel(rightPanel.current, rightInner, RIGHT_OUTER_X - rightInner)
  }
  // Place the panels before the first frame is drawn.
  useLayoutEffect(() => place(level.current))

  // The open window's breeze: 0 = still, 1 = full billow (eases in and out with the sash).
  const windowOpen = useAppStore((state) => state.windowOpen)
  const breeze = useRef(0)

  useFrame((state, delta) => {
    const target = closed ? 1 : 0
    const breezeTarget = windowOpen && animate ? 1 : 0
    const moving = level.current !== target
    if (!moving && breeze.current === 0 && breezeTarget === 0) return
    if (moving) {
      if (!animate) level.current = target
      else {
        const next = THREE.MathUtils.damp(level.current, target, CURTAIN_DAMPING, delta)
        level.current = Math.abs(next - target) < 0.001 ? target : next
        invalidate()
      }
    }
    const nextBreeze = THREE.MathUtils.damp(breeze.current, breezeTarget, BREEZE.ease, delta)
    breeze.current = Math.abs(nextBreeze - breezeTarget) < 0.001 ? breezeTarget : nextBreeze
    place(level.current)
    if (breeze.current > 0) {
      // Gusts: the folds deepen and the fabric drifts into the room, each panel a little out of step.
      const t = state.clock.elapsedTime
      for (const [panel, phase] of [
        [leftPanel.current, 0],
        [rightPanel.current, 1.7],
      ] as const) {
        if (!panel) continue
        const gust = 0.5 + 0.3 * Math.sin(t * BREEZE.speed + phase) + 0.2 * Math.sin(t * BREEZE.speed * 2.3 + phase * 2)
        const b = breeze.current * gust
        panel.scale.z *= 1 + BREEZE.depth * b
        panel.position.z += BREEZE.drift * b
        panel.position.x += Math.sin(t * BREEZE.speed * 1.4 + phase) * BREEZE.sway * b
      }
      invalidate()
    }
  })

  const rodStart = LEFT_OUTER_X - 0.08
  const rodEnd = RIGHT_OUTER_X + 0.08

  return (
    <group>
      <mesh ref={leftPanel} geometry={left} material={fabric} receiveShadow {...bind} />
      <mesh ref={rightPanel} geometry={right} material={fabric} receiveShadow {...bind} />
      <mesh position={[(rodStart + rodEnd) / 2, ROD_Y, Z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, rodEnd - rodStart, 8]} />
        <meshStandardMaterial color="#2a2f3d" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}

useGLTF.preload(MODEL_URL, DRACO_PATH)

export default Curtains
