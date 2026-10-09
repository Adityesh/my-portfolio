import { useEffect, useId, useRef, useState } from 'react'
import { credits } from '../../data/credits.ts'
import { useSceneSettings } from '../../hooks/useSceneSettings.ts'
import { useAppStore } from '../../store/useAppStore.ts'
import { useSettingsStore } from '../../store/useSettingsStore.ts'
import ToggleSwitch from './ToggleSwitch.tsx'

/** Hamburger menu (room view only) for toggling animations and visual effects. */
function SettingsMenu() {
  const inRoom = useAppStore((state) => state.view === 'room')
  const loading = useAppStore((state) => state.loading.active)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const settings = useSceneSettings()
  const { setAnimations, setEffects, setCameraDrift, setDust, reset } = useSettingsStore()
  const rawDrift = useSettingsStore((s) => s.cameraDrift)
  const rawDust = useSettingsStore((s) => s.dust)

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
          <ToggleSwitch
            label="Visual effects"
            description="Glow, soft shadows and grain (heavier on the GPU)"
            checked={settings.effects}
            onChange={setEffects}
          />
          <div className="mt-1 flex items-center justify-between border-t border-white/10 px-3 pt-2 pb-1 text-xs">
            <a href="?lite" className="text-sky-300 hover:underline focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none">
              Simple version
            </a>
            <button
              type="button"
              onClick={reset}
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
