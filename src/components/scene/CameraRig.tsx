import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { useEffect, useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import { CAMERA_AZIMUTH, CAMERA_POLAR, useResponsiveCamera } from '../../hooks/useResponsiveCamera.ts'

const { ACTION } = CameraControlsImpl
const DEG = Math.PI / 180
// Rotation is kept close to the default view so the open (cut-away) sides of the room always face the camera.
const POLAR_RANGE: [number, number] = [CAMERA_POLAR - 12 * DEG, CAMERA_POLAR + 8 * DEG]
const AZIMUTH_RANGE: [number, number] = [CAMERA_AZIMUTH - 20 * DEG, CAMERA_AZIMUTH + 20 * DEG]

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
