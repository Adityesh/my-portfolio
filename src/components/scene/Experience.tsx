import { ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import { socials } from '../../data/socials.ts'
import { useIsMobile } from '../../hooks/useIsMobile.ts'
import { useQuality } from '../../hooks/useQuality.ts'
import { useSceneSettings } from '../../hooks/useSceneSettings.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import { VIEWPOINTS, type PovViewpoint } from '../../store/viewpoints.ts'
import BedLedStrip from './BedLedStrip.tsx'
import BedsideLamp from './BedsideLamp.tsx'
import CameraRig from './CameraRig.tsx'
import DebugStats from './DebugStats.tsx'
import Clock from './Clock.tsx'
import Curtains from './Curtains.tsx'
import DustMotes from './DustMotes.tsx'
import { IntroContext } from './introTimeline.ts'
import LavaLamp from './LavaLamp.tsx'
import LightSwitch from './LightSwitch.tsx'
import Lights from './Lights.tsx'
import MonitorHitArea from './MonitorHitArea.tsx'
import NeonNameSign from './NeonNameSign.tsx'
import PcTower from './PcTower.tsx'
import PerformanceGovernor from './PerformanceGovernor.tsx'
import PovCamera from './PovCamera.tsx'
import PovEnclosure from './PovEnclosure.tsx'
import Room from './Room.tsx'
import RoomProps from './RoomProps.tsx'
import SceneReady from './SceneReady.tsx'
import SkyClock from './SkyClock.tsx'
import { FLOOR_Y } from './roomLayout.ts'
import SocialIcon3D from './SocialIcon3D.tsx'
import StringLights from './StringLights.tsx'
import ViewpointHotspot from './ViewpointHotspot.tsx'
import WindowBackdrop from './WindowBackdrop.tsx'
import WindowShaft from './WindowShaft.tsx'

// Post-processing is only downloaded when the quality level uses it.
const Effects = lazy(() => import('./Effects.tsx'))

const POV_VIEWPOINTS = VIEWPOINTS.filter((id): id is PovViewpoint => id !== 'room')

function Experience() {
  const roomRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()
  // Visitor settings (menu) with automatic defaults: OS reduced-motion preference, desktop vs mobile.
  const { animations, dust, debug } = useSceneSettings()
  const frameRate = useSettingsStore((s) => s.frameRate)
  const qualitySetting = useSettingsStore((s) => s.quality)
  // Rendering quality (Auto adapts it to the device; see PerformanceGovernor).
  const { config } = useQuality()
  const effects = config.bloom || config.ambientOcclusion || config.grain
  const gl = useThree((state) => state.gl)
  const viewpoint = useAppStore((s) => s.viewpoint)
  const view = useAppStore((s) => s.view)

  // Intro clock starts on the first frame after the scene (and the loaded model) mounts. It's kept stable
  // so switching animations off and on again doesn't replay the intro.
  const [clock] = useState<{ start: number | null }>(() => ({ start: null }))
  const intro = useMemo(() => ({ clock, reducedMotion: !animations }), [clock, animations])

  // Nothing that casts shadows moves, so render shadow maps once instead of every frame
  // (and again whenever the quality level turns shadows back on).
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
  }, [gl, config.shadows])

  return (
    <IntroContext.Provider value={intro}>
      <PerformanceGovernor animate={animations} frameRate={frameRate} quality={qualitySetting} isMobile={isMobile} />
      {debug && <DebugStats />}
      <SceneReady />
      <CameraRig targetRef={roomRef} />
      {/* First-person views: a perspective camera (replaces the room camera while mounted) and walls/ceiling. */}
      {viewpoint !== 'room' && (
        <>
          <PovCamera viewpoint={viewpoint} />
          <PovEnclosure />
        </>
      )}
      {viewpoint === 'room' && view === 'room' && POV_VIEWPOINTS.map((id) => <ViewpointHotspot key={id} viewpoint={id} />)}
      {/* Before everything that reads the shared sky state, so it's up to date when they run each frame. */}
      <SkyClock />
      <Lights lite={!config.fullLights} shadows={config.shadows} />
      <group ref={roomRef}>
        <Room />
      </group>
      <Clock />
      <RoomProps />
      <Curtains />
      <NeonNameSign />
      <LavaLamp glow={config.fullLights} />
      <BedLedStrip glow={config.fullLights} />
      <StringLights animate={animations} glow={config.fullLights} />
      <MonitorHitArea />
      <LightSwitch />
      <BedsideLamp />
      <PcTower />
      {socials.map((social) => (
        <SocialIcon3D key={social.id} social={social} />
      ))}
      <WindowBackdrop />
      <WindowShaft />
      {dust && config.dust > 0 && <DustMotes density={config.dust} />}
      {config.contactShadows && (
        <ContactShadows position={[0.1, FLOOR_Y + 0.005, 0.14]} scale={9.5} far={3} blur={2.5} opacity={0.6} frames={1} />
      )}
      {effects && (
        <Suspense fallback={null}>
          <Effects multisampling={config.multisampling} bloom={config.bloom} ambientOcclusion={config.ambientOcclusion} grain={config.grain} />
        </Suspense>
      )}
    </IntroContext.Provider>
  )
}

export default Experience
