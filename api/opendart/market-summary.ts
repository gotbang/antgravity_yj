import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getMarketSummary } from '../../src/server/opendart'

export default async function handler(_: VercelRequest, res: VercelResponse) {
  try {
    const summary = await getMarketSummary()
    res.status(200).json(summary)
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'OpenDART 요약을 불러오지 못했어.',
    })
  }
}
