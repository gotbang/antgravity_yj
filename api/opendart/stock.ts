import type { IncomingMessage, ServerResponse } from 'node:http'
import { getStockSnapshot } from '../../src/server/opendart'
import { applyRateLimit, getClientIdentifier } from '../../src/server/request-security'

type VercelLikeRequest = IncomingMessage & {
  query: Record<string, string | string[] | undefined>
}

type VercelLikeResponse = ServerResponse<IncomingMessage> & {
  status: (code: number) => VercelLikeResponse
  json: (body: unknown) => void
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  const symbol = typeof req.query.symbol === 'string' ? req.query.symbol : null

  if (!symbol) {
    res.status(400).json({ error: 'symbol 파라미터가 필요해.' })
    return
  }

  const rateLimitResult = applyRateLimit({
    key: `stock:${getClientIdentifier(req)}`,
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
    const stock = await getStockSnapshot(symbol)
    res.status(200).json(stock)
  } catch {
    res.status(500).json({
      error: '종목 데이터를 지금 불러오지 못했어.',
    })
  }
}
