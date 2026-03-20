import { memo } from 'react'
import type { StockPrediction } from '../lib/market'

function getStatusClass(label: string) {
  if (label.includes('하락')) {
    return 'status-pill status-down'
  }

  if (label.includes('중립')) {
    return 'status-pill status-neutral'
  }

  return 'status-pill status-up'
}

type StockListItemProps = {
  stock: StockPrediction
  isWatched: boolean
  onSelectSymbol: (symbol: string) => void
  onToggleSymbol: (symbol: string) => void
}

function StockListItemComponent({
  stock,
  isWatched,
  onSelectSymbol,
  onToggleSymbol,
}: StockListItemProps) {
  return (
    <div className="stock-row stock-row-static">
      <button type="button" className="stock-row-content" onClick={() => onSelectSymbol(stock.symbol)}>
        <div className="stock-content-stack">
          <div className="stock-main">
            <div className="stock-title-block">
              <strong>{stock.symbol}</strong>
              <span className="stock-sector-chip">{stock.sector}</span>
            </div>
            <span className={getStatusClass(stock.statusLabel)}>{stock.statusLabel}</span>
          </div>
          <div className="stock-subcopy">
            <span>{stock.latestDisclosureDate}</span>
            <p>{stock.latestDisclosureTitle}</p>
          </div>
        </div>
        <div className="stock-metrics stock-metrics-real">
          <strong>{stock.currentPriceLabel}</strong>
          <span>{stock.priceChangeLabel}</span>
          <span>{stock.priceChangeRateLabel}</span>
        </div>
        <div className="stock-metrics stock-metrics-real stock-metrics-financial">
          <span>{stock.revenueSummary}</span>
          <span>{stock.operatingIncomeSummary}</span>
          <span>{stock.debtRatioSummary}</span>
        </div>
      </button>
      <button
        type="button"
        className={`mini-star${isWatched ? ' mini-star-active' : ''}`}
        onClick={() => onToggleSymbol(stock.symbol)}
        aria-label={isWatched ? `${stock.symbol} 관심 해제` : `${stock.symbol} 관심 추가`}
      >
        ★
      </button>
    </div>
  )
}

export const StockListItem = memo(StockListItemComponent)
