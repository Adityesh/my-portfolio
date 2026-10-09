// Time of day shown through the window: the visitor's real local time, or a fixed preset from the menu.
export const TIME_OF_DAY = ['live', 'dawn', 'day', 'dusk', 'night'] as const
export type TimeOfDaySetting = (typeof TIME_OF_DAY)[number]

/** Local hour (0..24) each preset shows. */
export const TIME_PRESET_HOURS: Record<Exclude<TimeOfDaySetting, 'live'>, number> = {
  dawn: 6.3,
  day: 13,
  dusk: 18.7,
  night: 23.5,
}

export const TIME_OF_DAY_LABELS: Record<TimeOfDaySetting, string> = {
  live: 'Live',
  dawn: 'Dawn',
  day: 'Day',
  dusk: 'Dusk',
  night: 'Night',
}

/** Current local time as a fractional hour (e.g. 14.5 = 2:30 pm). */
export function localHour(date = new Date()): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
}
