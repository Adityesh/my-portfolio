import { ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import { socials } from '../../data/socials.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useSceneSettings } from '../../hooks/useSceneSettings.ts'
import CameraRig from './CameraRig.tsx'
import DebugStats from './DebugStats.tsx'
import Clock from './Clock.tsx'
import Curtains from './Curtains.tsx'
import DustMotes from './DustMotes.tsx'
import FrameDriver from './FrameDriver.tsx'
import { IntroContext } from './introTimeline.ts'
import Lights from './Lights.tsx'
import MonitorHitArea from './MonitorHitArea.tsx'
import NeonNameSign from './NeonNameSign.tsx'
import Room from './Room.tsx'
import RoomProps from './RoomProps.tsx'
import { FLOOR_Y } from './roomLayout.ts'
import SocialIcon3D from './SocialIcon3D.tsx'
import StringLights from './StringLights.tsx'
import WindowBackdrop from './WindowBackdrop.tsx'
import WindowShaft from './WindowShaft.tsx'

// Post-processing is only downloaded when visual effects are on (desktop by default).
const Effects = lazy(() => import('./Effects.tsx'))

// Frame rate for ambient animation (the Canvas renders on demand).
const ANIMATION_FPS = 30

function Experience() {
  const roomRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()
  // Visitor settings (menu) with automatic defaults: OS reduced-motion preference, desktop vs mobile.
  const { animations, effects, dust, debug } = useSceneSettings()
  const gl = useThree((state) => state.gl)

  // Intro clock starts on the first frame after the scene (and the loaded model) mounts. It's kept stable
  // so switching animations off and on again doesn't replay the intro.
  const [clock] = useState<{ start: number | null }>(() => ({ start: null }))
  const intro = useMemo(() => ({ clock, reducedMotion: !animations }), [clock, animations])

  // Nothing that casts shadows moves, so render shadow maps once instead of every frame.
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
  }, [gl])

  return (
    <IntroContext.Provider value={intro}>
      {animations && <FrameDriver fps={ANIMATION_FPS} />}
      {debug && <DebugStats />}
      <CameraRig targetRef={roomRef} />
      <Lights lite={isMobile} />
      <group ref={roomRef}>
        <Room />
      </group>
      <Clock />
      <RoomProps />
      <Curtains />
      <NeonNameSign />
      <StringLights animate={animations} glow={!isMobile} />
      <MonitorHitArea />
      {socials.map((social) => (
        <SocialIcon3D key={social.id} social={social} />
      ))}
      <WindowBackdrop />
      <WindowShaft />
      {dust && <DustMotes density={isMobile ? 0.5 : 1} />}
      {effects && (
        <ContactShadows position={[0.1, FLOOR_Y + 0.005, 0.14]} scale={9.5} far={3} blur={2.5} opacity={0.6} frames={1} />
      )}
      {effects && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
    </IntroContext.Provider>
  )
}

export default Experience
