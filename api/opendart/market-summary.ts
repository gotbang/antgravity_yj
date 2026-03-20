import type { IncomingMessage, ServerResponse } from 'node:http'
import { getMarketSummary } from '../../src/server/opendart'
import { applyRateLimit, getClientIdentifier } from '../../src/server/request-security'

type VercelLikeRequest = IncomingMessage

type VercelLikeResponse = ServerResponse<IncomingMessage> & {
  status: (code: number) => VercelLikeResponse
  json: (body: unknown) => void
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  const rateLimitResult = applyRateLimit({
    key: `market-summary:${getClientIdentifier(req)}`,
    limit: 60,
    windowMs: 60 * 1000,
  })

  if (!rateLimitResult.ok) {
    const retryAfterSeconds =
      'retryAfterSeconds' in rateLimitResult ? rateLimitResult.retryAfterSeconds : 60

    res.setHeader('Retry-After', String(retryAfterSeconds))
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
