import { useEffect, useState } from 'react'
import { localHour, TIME_PRESET_HOURS } from '../store/timeOfDay.ts'
import { useSettingsStore } from '../store/useSettingsStore.ts'

// How often the live sky catches up with the clock (it changes slowly, so once every half minute is plenty).
const LIVE_UPDATE_MS = 30_000

/** ?time=14.5 shows that local hour, overriding the menu (for previewing the sky). Read once at load. */
function urlHour(): number | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('time')
  if (value === null) return null
  const hour = Number(value)
  return Number.isFinite(hour) ? ((hour % 24) + 24) % 24 : null
}
const URL_HOUR = urlHour()

/** The local hour (0..24) the window should show: live time, a preset from the menu, or the ?time= override. */
export function useSkyHour(): number {
  const setting = useSettingsStore((s) => s.timeOfDay)
  // Re-render every so often in live mode; the hour itself is read from the clock on each render.
  const [, setTick] = useState(0)

  useEffect(() => {
    if (setting !== 'live' || URL_HOUR !== null) return
    const id = window.setInterval(() => setTick((tick) => tick + 1), LIVE_UPDATE_MS)
    return () => window.clearInterval(id)
  }, [setting])

  if (URL_HOUR !== null) return URL_HOUR
  return setting === 'live' ? localHour() : TIME_PRESET_HOURS[setting]
}
