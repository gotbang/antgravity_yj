import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getMarketSummary } from '../../src/server/opendart'
import { applyRateLimit, getClientIdentifier } from '../../src/server/request-security'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rateLimitResult = applyRateLimit({
    key: `market-summary:${getClientIdentifier(req)}`,
    limit: 60,
    windowMs: 60 * 1000,
  })

  if (!rateLimitResult.ok) {
    res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds))
    res.status(429).json({ error: '요청이 너무 많아. 잠깐 뒤에 다시 시도해줘.' })
    return
  }

  try {
    const summary = await getMarketSummary()
    res.status(200).json(summary)
  } catch {
    res.status(500).json({
      error: '시장 요약을 지금 불러오지 못했어.',
    })
  }
}
