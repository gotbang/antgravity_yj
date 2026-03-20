import { loadEnv } from 'vite'
import { refreshAllCaches } from '../src/server/opendart.ts'

async function main() {
  Object.assign(process.env, loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), ''))
  const result = await refreshAllCaches({ forceRefresh: true })

  console.log(
    JSON.stringify(
      {
        refreshedAt: new Date().toISOString(),
        stockCount: result.stocks.length,
        sourceLabel: result.marketSummary.sourceLabel,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
