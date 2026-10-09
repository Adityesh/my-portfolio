import * as THREE from 'three'

/**
 * Splits a geometry into the triangles that lie entirely inside `box` and the rest (box in the geometry's own
 * space). Used to cut a single object out of a merged mesh. Returns new geometries; the caller disposes them.
 */
export function splitGeometryByBox(geometry: THREE.BufferGeometry, box: THREE.Box3): { inside: THREE.BufferGeometry; outside: THREE.BufferGeometry } {
  const position = geometry.getAttribute('position')
  const index = geometry.index
  const triangleCount = index ? index.count / 3 : position.count / 3
  const vertex = (tri: number, corner: number) => (index ? index.getX(tri * 3 + corner) : tri * 3 + corner)
  const point = new THREE.Vector3()

  const insideIndices: number[] = []
  const outsideIndices: number[] = []
  for (let tri = 0; tri < triangleCount; tri++) {
    let allInside = true
    for (let corner = 0; corner < 3 && allInside; corner++) {
      point.fromBufferAttribute(position, vertex(tri, corner))
      allInside = box.containsPoint(point)
    }
    const target = allInside ? insideIndices : outsideIndices
    target.push(vertex(tri, 0), vertex(tri, 1), vertex(tri, 2))
  }

  // Both halves share the original vertex attributes and just index different triangles.
  const make = (indices: number[]) => {
    const part = new THREE.BufferGeometry()
    for (const [name, attribute] of Object.entries(geometry.attributes)) part.setAttribute(name, attribute)
    part.setIndex(indices)
    part.computeBoundingBox()
    part.computeBoundingSphere()
    return part
  }
  return { inside: make(insideIndices), outside: make(outsideIndices) }
}
