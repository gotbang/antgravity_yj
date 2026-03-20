import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getStockSnapshot } from '../../src/server/opendart'
import { applyRateLimit, getClientIdentifier } from '../../src/server/request-security'

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds))
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
