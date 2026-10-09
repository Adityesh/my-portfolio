import { useMediaQuery } from './useMediaQuery.ts'

/** True when the visitor has asked the OS to minimise motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
