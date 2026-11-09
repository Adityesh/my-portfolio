import { useAppStore } from '../store/useAppStore.ts'

// Serverless function that counts unique visitors (api/visitors.ts). Vercel only, so nothing runs in dev.
const ENDPOINT = '/api/visitors'
// Set once this browser session has registered, so reloads only read the count.
const SESSION_KEY = 'visit-registered'

function readFlag(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writeFlag() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    // Storage blocked (private mode): the server dedupes anyway.
  }
}

/**
 * Counts this visit (once per browser session) and publishes the unique visitor total to the store for the settings
 * menu. The server dedupes by a salted hash, so a repeat visit never raises the count. Fails silently: no count, no line.
 */
export async function registerVisit() {
  if (!import.meta.env.PROD) return
  const registered = readFlag()
  try {
    const response = await fetch(ENDPOINT, { method: registered ? 'GET' : 'POST' })
    if (!response.ok) return
    const data: unknown = await response.json()
    if (typeof data === 'object' && data !== null && 'count' in data && typeof data.count === 'number') {
      if (!registered) writeFlag()
      useAppStore.getState().setVisitorCount(data.count)
    }
  } catch {
    // Offline or blocked: leave the count hidden.
  }
}
