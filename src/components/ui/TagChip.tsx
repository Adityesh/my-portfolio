type TagChipProps = {
  label: string
}

function TagChip({ label }: TagChipProps) {
  return (
    <li className="rounded-full border border-sky-300/20 bg-sky-400/10 px-2.5 py-0.5 font-mono text-xs text-sky-200">
      {label}
    </li>
  )
}

export default TagChip
