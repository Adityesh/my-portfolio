import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { useEffect, useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import { useResponsiveCamera } from '../../hooks/useResponsiveCamera.ts'

const { ACTION } = CameraControlsImpl
const DEG = Math.PI / 180
// Isometric polar angle: acos(1 / sqrt(3)) ≈ 54.7°. Azimuth for (1, 1, 1) is 45°.
// Rotation is kept close to it so the open (cut-away) sides of the room always face the camera.
const POLAR_RANGE: [number, number] = [40 * DEG, 65 * DEG]
const AZIMUTH_RANGE: [number, number] = [25 * DEG, 65 * DEG]

type CameraRigProps = {
  targetRef: RefObject<THREE.Object3D | null>
}

function CameraRig({ targetRef }: CameraRigProps) {
  const controlsRef = useRef<CameraControls>(null)

  useResponsiveCamera(controlsRef, targetRef)

  // Rotate + zoom only; no panning, so the room can't be dragged out of frame.
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.mouseButtons.right = ACTION.NONE
    controls.mouseButtons.middle = ACTION.ZOOM
    controls.touches.two = ACTION.TOUCH_ZOOM
    controls.touches.three = ACTION.NONE
  }, [])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minPolarAngle={POLAR_RANGE[0]}
      maxPolarAngle={POLAR_RANGE[1]}
      minAzimuthAngle={AZIMUTH_RANGE[0]}
      maxAzimuthAngle={AZIMUTH_RANGE[1]}
    />
  )
}

export default CameraRig
