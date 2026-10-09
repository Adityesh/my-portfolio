import { useEffect, useId, useRef, useState } from 'react'
import { credits } from '../../data/credits.ts'
import { useSceneSettings } from '../../hooks/useSceneSettings.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { QUALITY_LABELS } from '../../store/quality.ts'
import { RGB_MODE_LABELS, RGB_MODES } from '../../store/rgbModes.ts'
import { TIME_OF_DAY, TIME_OF_DAY_LABELS } from '../../store/timeOfDay.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import SegmentedControl from './SegmentedControl.tsx'
import ToggleSwitch from './ToggleSwitch.tsx'

/** Hamburger menu (room view only) for animations, frame rate, rendering quality and debug info. */
function SettingsMenu() {
  const inRoom = useAppStore((state) => state.view === 'room')
  const loading = useAppStore((state) => state.loading.active)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const settings = useSceneSettings()
  const { setAnimations, setQuality, setCameraDrift, setDust, setSound, setDebug, setFrameRate, reset } = useSettingsStore()
  const frameRate = useSettingsStore((s) => s.frameRate)
  const quality = useSettingsStore((s) => s.quality)
  // Level in use (shown for Auto), and whether the safety net had to override the chosen level.
  const currentLevel = useAppStore((s) => s.quality?.level)
  const overridden = useAppStore((s) => s.quality?.overridden ?? false)
  const setQualityOverride = useAppStore((s) => s.setQualityOverride)
  const rawDrift = useSettingsStore((s) => s.cameraDrift)
  const rawDust = useSettingsStore((s) => s.dust)
  const sound = useSettingsStore((s) => s.sound)
  const timeOfDay = useSettingsStore((s) => s.timeOfDay)
  const setTimeOfDay = useSettingsStore((s) => s.setTimeOfDay)
  const music = useAppStore((s) => s.music)
  const setMusic = useAppStore((s) => s.setMusic)
  const curtainsClosed = useAppStore((s) => s.curtainsClosed)
  const setCurtainsClosed = useAppStore((s) => s.setCurtainsClosed)
  const rgbMode = useAppStore((s) => s.rgbMode)
  const setRgbMode = useAppStore((s) => s.setRgbMode)
  const roomLight = useAppStore((s) => s.roomLight)
  const setRoomLight = useAppStore((s) => s.setRoomLight)

  // Close on Esc (returning focus to the button) or on a click outside the menu.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  // Hidden while the scene loads and in the projects view (where the title bar has its own controls).
  if (!inRoom || loading) return null

  return (
    <div ref={containerRef} className="absolute top-4 right-4 z-30">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Display settings"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="ml-auto flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-neutral-200 backdrop-blur transition hover:bg-black/70 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Display settings"
          className="mt-2 w-72 rounded-xl border border-white/10 bg-[#0f1729]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-sm motion-safe:animate-[fade-in_150ms_ease-out]"
        >
          <p className="px-3 pt-1 pb-2 font-mono text-xs text-neutral-500">// settings</p>
          <ToggleSwitch
            label="Animations"
            description="Moving lights, steam, twinkling, the cat breathing"
            checked={settings.animations}
            onChange={setAnimations}
          />
          <ToggleSwitch
            label="Camera drift"
            description="Gentle sway of the view when idle"
            checked={settings.animations && rawDrift}
            disabled={!settings.animations}
            onChange={setCameraDrift}
          />
          <ToggleSwitch
            label="Dust particles"
            description="Floating dust in the light"
            checked={settings.animations && rawDust}
            disabled={!settings.animations}
            onChange={setDust}
          />
          <SegmentedControl
            label="Time of day"
            description={timeOfDay === 'live' ? 'The sky follows your local time' : 'Sky through the window'}
            options={TIME_OF_DAY.map((value) => ({ value, label: TIME_OF_DAY_LABELS[value] }))}
            value={timeOfDay}
            stacked
            onChange={setTimeOfDay}
          />
          <ToggleSwitch label="Room light" description="Same as the switch by the door" checked={roomLight} onChange={setRoomLight} />
          <ToggleSwitch label="Curtains" description="Draw the curtains (or tap one)" checked={curtainsClosed} onChange={setCurtainsClosed} />
          <SegmentedControl
            label="LEDs"
            description="PC and LED strip lighting (or tap the PC)"
            options={RGB_MODES.map((value) => ({ value, label: RGB_MODE_LABELS[value] }))}
            value={rgbMode}
            stacked
            onChange={setRgbMode}
          />
          <ToggleSwitch label="Sound" description="Sound effects when you poke things" checked={sound} onChange={setSound} />
          <ToggleSwitch
            label="Music"
            description="Lo-fi from the headphones on the desk"
            checked={sound && music}
            disabled={!sound}
            onChange={setMusic}
          />
          <SegmentedControl
            label="Frame rate"
            description="Auto uses 60 when the device keeps up"
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 30, label: '30' },
              { value: 60, label: '60' },
            ]}
            value={frameRate}
            disabled={!settings.animations}
            onChange={setFrameRate}
          />
          <SegmentedControl
            label="Quality"
            description={
              overridden && currentLevel && quality !== 'auto'
                ? `${QUALITY_LABELS[quality]} was too heavy for this device, using ${QUALITY_LABELS[currentLevel]}`
                : quality === 'auto' && currentLevel
                  ? `Auto adapts to your device (now ${QUALITY_LABELS[currentLevel]})`
                  : 'Glow, shadows, lights and sharpness'
            }
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Med' },
              { value: 'low', label: 'Low' },
              { value: 'minimal', label: 'Min' },
            ]}
            value={quality}
            stacked
            onChange={(value) => {
              // Picking a level (even the same one) lifts the safety net's override, so it can be retried.
              setQualityOverride(null)
              setQuality(value)
            }}
          />
          <ToggleSwitch
            label="Debug info"
            description="FPS, draw calls and renderer stats (top left)"
            checked={settings.debug}
            onChange={setDebug}
          />
          <div className="mt-1 flex items-center justify-between border-t border-white/10 px-3 pt-2 pb-1 text-xs">
            <a href="?lite" className="text-sky-300 hover:underline focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none">
              Simple version
            </a>
            <button
              type="button"
              onClick={() => {
                setQualityOverride(null)
                reset()
              }}
              className="text-neutral-400 hover:text-neutral-200 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
            >
              Reset to defaults
            </button>
          </div>
          <p className="px-3 pt-2 pb-1 text-[11px] leading-snug text-neutral-500">
            {credits.map((credit) => (
              <span key={credit.url} className="block">
                3D room:{' '}
                <a href={credit.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-neutral-300 hover:underline">
                  {credit.work}
                </a>{' '}
                by {credit.author},{' '}
                <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-neutral-300 hover:underline">
                  {credit.license}
                </a>
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  )
}

export default SettingsMenu
