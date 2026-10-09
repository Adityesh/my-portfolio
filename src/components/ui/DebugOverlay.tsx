import { useSceneSettings } from '../../hooks/useSceneSettings.ts'
import { useAppStore } from '../../store/useAppStore.ts'

// Frame cap of the ambient animation loop (see Experience.tsx); shown so a steady 30 doesn't look like a problem.
const FRAME_CAP = 30

const number = new Intl.NumberFormat('en')

/** Top-left FPS / renderer stats panel, toggled from the settings menu. */
function DebugOverlay() {
  const settings = useSceneSettings()
  const stats = useAppStore((state) => state.debugStats)
  if (!settings.debug) return null

  const cap = FRAME_CAP
  const fpsColor = !stats ? 'text-neutral-400' : stats.fps === 0 || (cap && stats.fps >= cap - 3) ? 'text-emerald-300' : stats.fps >= 20 ? 'text-amber-300' : 'text-rose-300'
  const rows: [string, string][] = stats
    ? [
        ['frame', stats.frameMs ? `${stats.frameMs.toFixed(1)} ms` : 'idle'],
        ['draw calls', number.format(stats.drawCalls)],
        ['triangles', number.format(stats.triangles)],
        ['geometries', number.format(stats.geometries)],
        ['textures', number.format(stats.textures)],
        ['programs', number.format(stats.programs)],
        ['resolution', `${stats.width}×${stats.height} @${stats.dpr}x`],
        ['mode', `${settings.isMobile ? 'mobile' : 'desktop'} · effects ${settings.effects ? 'on' : 'off'}`],
        ['gpu', stats.gpu],
      ]
    : []

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-4 left-4 z-40 w-60 rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] leading-relaxed text-neutral-300 backdrop-blur-sm"
    >
      <div className="flex items-baseline justify-between">
        <span className={`text-lg font-semibold ${fpsColor}`}>{stats ? stats.fps : '–'} fps</span>
        <span className="text-neutral-500">{settings.animations ? `cap ${FRAME_CAP}` : 'on demand'}</span>
      </div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3">
          <span className="shrink-0 text-neutral-500">{label}</span>
          <span className="truncate text-right" title={value}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default DebugOverlay
