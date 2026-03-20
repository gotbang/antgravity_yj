import type { IncomingMessage } from 'node:http'

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  expiresAt: number
}

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number }

const rateLimitStore = new Map<string, RateLimitEntry>()

function getHeaderValue(header: string | string[] | undefined) {
  if (Array.isArray(header)) {
    return header[0] ?? null
  }

  return header ?? null
}

export function getClientIdentifier(req: IncomingMessage) {
  const forwardedFor = getHeaderValue(req.headers['x-forwarded-for'])

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown'
  }

  return req.socket.remoteAddress ?? 'unknown'
}

export function applyRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = rateLimitStore.get(options.key)

  if (!existing || existing.expiresAt <= now) {
    rateLimitStore.set(options.key, {
      count: 1,
      expiresAt: now + options.windowMs,
    })

    return { ok: true }
  }

  if (existing.count >= options.limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)),
    }
  }

  existing.count += 1
  rateLimitStore.set(options.key, existing)

  return { ok: true }
}

export function resetRequestSecurityForTest() {
  rateLimitStore.clear()
}
