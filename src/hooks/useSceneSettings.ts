import { useSettingsStore } from '../store/useSettingsStore.ts'
import { useIsMobile } from './useIsMobile.ts'
import { useReducedMotion } from './useReducedMotion.ts'

/** Effective scene settings: the visitor's choices, with automatic defaults filled in. */
export function useSceneSettings() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const animations = useSettingsStore((s) => s.animations) ?? !reducedMotion
  const effects = useSettingsStore((s) => s.effects) ?? !isMobile
  const cameraDrift = useSettingsStore((s) => s.cameraDrift)
  const dust = useSettingsStore((s) => s.dust)
  return { animations, effects, cameraDrift: animations && cameraDrift, dust: animations && dust }
}
