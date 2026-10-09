import { useMediaQuery } from './useMediaQuery.ts'

/** True on touch-first devices or viewports narrower than 768px. */
export function useIsMobile(): boolean {
  return useMediaQuery('(pointer: coarse), (max-width: 767px)')
}
