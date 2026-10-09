import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { useEffect, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { DRACO_PATH } from './assetPaths.ts'

type Axis = 'x' | 'y' | 'z'

type FittedModelProps = Omit<ThreeElements['group'], 'children'> & {
  url: string
  /** Applied to the model before measuring, e.g. to stand a flat model upright. */
  modelRotation?: [number, number, number]
  /** Scale uniformly so the model's size along `axis` equals `size` (world units). */
  fit: { axis: Axis; size: number }
  /** Which point of the bounding box sits at the group origin. */
  anchor?: 'bottom' | 'back'
  castShadow?: boolean
  receiveShadow?: boolean
  /** Adjust a mesh's material after loading (define it outside the component so it stays stable). */
  prepareMaterial?: (material: THREE.MeshStandardMaterial, mesh: THREE.Mesh) => void
  children?: ReactNode
}

/**
 * Loads a prop GLB and fits it to a real-world size, whatever units it was authored in.
 * 'bottom' puts the base on the origin (floor/desk items); 'back' puts the -x face there (items on the x-min wall).
 */
function FittedModel({
  url,
  modelRotation = [0, 0, 0],
  fit,
  anchor = 'bottom',
  castShadow = false,
  receiveShadow = false,
  prepareMaterial,
  children,
  ...groupProps
}: FittedModelProps) {
  const { scene } = useGLTF(url, DRACO_PATH)
  const [rx, ry, rz] = modelRotation

  const { object, scale, offset, clonedMaterials } = useMemo(() => {
    const object = scene.clone(true)
    const clonedMaterials: THREE.Material[] = []
    object.rotation.set(rx, ry, rz)
    object.updateMatrixWorld(true)
    object.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = castShadow
      mesh.receiveShadow = receiveShadow
      if (prepareMaterial && mesh.material instanceof THREE.MeshStandardMaterial) {
        // Clone so edits don't leak into the cached GLTF used elsewhere.
        const material = mesh.material.clone()
        clonedMaterials.push(material)
        mesh.material = material
        prepareMaterial(material, mesh)
      }
    })
    const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = fit.size / size[fit.axis]
    const anchorPoint =
      anchor === 'bottom' ? new THREE.Vector3(center.x, box.min.y, center.z) : new THREE.Vector3(box.min.x, center.y, center.z)
    return { object, scale, offset: anchorPoint.multiplyScalar(-scale), clonedMaterials }
  }, [scene, rx, ry, rz, fit.axis, fit.size, anchor, castShadow, receiveShadow, prepareMaterial])

  useEffect(() => () => clonedMaterials.forEach((m) => m.dispose()), [clonedMaterials])

  return (
    <group {...groupProps}>
      <group position={offset} scale={scale}>
        <primitive object={object} />
      </group>
      {children}
    </group>
  )
}

export default FittedModel
