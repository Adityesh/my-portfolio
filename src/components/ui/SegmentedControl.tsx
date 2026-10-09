type Option<T> = { value: T; label: string }

type SegmentedControlProps<T extends string | number> = {
  label: string
  description: string
  options: Option<T>[]
  value: T
  disabled?: boolean
  /** Put the options on their own full-width row below the label (for longer option lists). */
  stacked?: boolean
  onChange: (value: T) => void
}

/** Labelled row of mutually exclusive options (radio group) for the settings menu. */
function SegmentedControl<T extends string | number>({
  label,
  description,
  options,
  value,
  disabled = false,
  stacked = false,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex gap-4 px-3 py-2.5 ${stacked ? 'flex-col gap-2' : 'items-center justify-between'} ${disabled ? 'opacity-40' : ''}`}
    >
      <span>
        <span className="block text-sm font-medium text-neutral-100">{label}</span>
        <span className="block text-xs text-neutral-400">{description}</span>
      </span>
      <div role="radiogroup" aria-label={label} className={`flex shrink-0 rounded-full bg-white/10 p-0.5 ${stacked ? 'w-full' : ''}`}>
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`rounded-full px-2.5 py-1 text-xs transition ${stacked ? 'flex-1' : ''} focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none disabled:cursor-not-allowed ${
                selected ? 'bg-sky-500 text-white' : 'text-neutral-300 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SegmentedControl
