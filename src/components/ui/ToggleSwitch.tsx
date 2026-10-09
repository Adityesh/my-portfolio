type ToggleSwitchProps = {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

/** Accessible on/off switch row for the settings menu. */
function ToggleSwitch({ label, description, checked, disabled = false, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <span>
        <span className="block text-sm font-medium text-neutral-100">{label}</span>
        <span className="block text-xs text-neutral-400">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-sky-500' : 'bg-white/15'}`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`}
        />
      </span>
    </button>
  )
}

export default ToggleSwitch
