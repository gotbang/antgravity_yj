import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getStockSnapshot } from '../../src/server/opendart'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = typeof req.query.symbol === 'string' ? req.query.symbol : null

  if (!symbol) {
    res.status(400).json({ error: 'symbol 파라미터가 필요해.' })
    return
  }

  try {
    const stock = await getStockSnapshot(symbol)
    res.status(200).json(stock)
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'OpenDART 종목 데이터를 불러오지 못했어.',
    })
  }
}
