import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACO_PATH } from './assetPaths.ts'
import { WINDOW } from './roomLayout.ts'

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
    const cx = (position.getX(tri) + position.getX(tri + 1) + position.getX(tri + 2)) / 3
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

type PanelProps = {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  /** World x where the panel's left edge goes. */
  minX: number
}

/** Stretches a panel to PANEL_WIDTH x (TOP_Y - BOTTOM_Y) with its left edge at `minX`. */
function Panel({ geometry, material, minX }: PanelProps) {
  const box = geometry.boundingBox!
  const size = box.getSize(new THREE.Vector3())
  const scale: [number, number, number] = [PANEL_WIDTH / size.x, (TOP_Y - BOTTOM_Y) / size.y, DEPTH / size.z]
  return (
    <mesh
      geometry={geometry}
      material={material}
      scale={scale}
      position={[minX - box.min.x * scale[0], BOTTOM_Y - box.min.y * scale[1], Z - (box.min.z + size.z / 2) * scale[2]]}
      receiveShadow
    />
  )
}

/** Curtain panels framing the window, plus a rod. */
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

  const rodStart = WINDOW.minX + OVERLAP - PANEL_WIDTH - 0.08
  const rodEnd = WINDOW.maxX - OVERLAP + PANEL_WIDTH + 0.08

  return (
    <group>
      <Panel geometry={left} material={fabric} minX={WINDOW.minX + OVERLAP - PANEL_WIDTH} />
      <Panel geometry={right} material={fabric} minX={WINDOW.maxX - OVERLAP} />
      <mesh position={[(rodStart + rodEnd) / 2, ROD_Y, Z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, rodEnd - rodStart, 8]} />
        <meshStandardMaterial color="#2a2f3d" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}

useGLTF.preload(MODEL_URL, DRACO_PATH)

export default Curtains
