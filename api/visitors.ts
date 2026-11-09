import { createHash } from 'node:crypto'

// Unique visitor counter (Vercel serverless function), shown in the settings menu.
// POST registers the caller and returns { count }; GET returns { count } only.
// Visitors are kept in a Redis HyperLogLog (Upstash, REST API) as salted SHA-256 hashes of IP + user agent: no raw
// IPs are stored, the same browser is never counted twice, and the count is accurate to about 1%.

// Redis key of the HyperLogLog.
const KEY = 'visitors'
// Link-preview crawlers, search bots and headless browsers: they see the count but aren't added to it.
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|whatsapp|vercel/i
// Used when the VISITOR_SALT env var isn't set.
const DEFAULT_SALT = 'late-night-room'

type RedisCommand = (string | number)[]

/** Runs commands on Upstash Redis (one round trip); null if the store isn't configured or fails. */
async function redis(commands: RedisCommand[]): Promise<unknown[] | null> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
    })
    if (!response.ok) return null
    const results = (await response.json()) as { result?: unknown; error?: string }[]
    if (results.some((entry) => entry.error)) return null
    return results.map((entry) => entry.result)
  } catch {
    return null
  }
}

function reply(count: number | null): Response {
  const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' }
  if (count === null) return new Response(JSON.stringify({ error: 'unavailable' }), { status: 503, headers })
  return new Response(JSON.stringify({ count }), { headers })
}

function visitorId(request: Request): string {
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()
  const agent = request.headers.get('user-agent') ?? ''
  const salt = process.env.VISITOR_SALT ?? DEFAULT_SALT
  return createHash('sha256').update(`${salt}|${ip}|${agent}`).digest('hex')
}

async function count(commands: RedisCommand[]): Promise<Response> {
  const results = await redis([...commands, ['PFCOUNT', KEY]])
  const total = results?.at(-1)
  return reply(typeof total === 'number' ? total : null)
}

export function GET(): Promise<Response> {
  return count([])
}

export function POST(request: Request): Promise<Response> {
  const isBot = BOT_PATTERN.test(request.headers.get('user-agent') ?? '')
  return count(isBot ? [] : [['PFADD', KEY, visitorId(request)]])
}
