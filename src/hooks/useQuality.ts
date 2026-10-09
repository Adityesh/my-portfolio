import { useAppStore } from '../store/useAppStore.ts'
import { configFor, initialQuality, type QualityConfig, type QualityLevel } from '../store/quality.ts'
import { useSettingsStore } from '../store/useSettingsStore.ts'
import { useIsMobile } from './useIsMobile.ts'

/**
 * Current rendering quality level and its settings (set by the performance governor once the scene runs),
 * with phone limits applied.
 */
export function useQuality(): { level: QualityLevel; config: QualityConfig & { multisampling: number } } {
  const isMobile = useIsMobile()
  const setting = useSettingsStore((s) => s.quality)
  const learned = useSettingsStore((s) => s.learnedQuality)
  const current = useAppStore((s) => s.quality?.level)
  const level = current ?? initialQuality(setting, learned, isMobile)
  return { level, config: configFor(level, isMobile) }
}
