import {
  filterStocks,
  getStockPrediction,
  toggleWatchlist,
} from './market'

describe('market helpers', () => {
  it('검색어를 대소문자 구분 없이 필터링한다', () => {
    expect(filterStocks('nav')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbol: 'NAVER' }),
      ]),
    )
  })

  it('미등록 종목은 기본 예측값을 반환한다', () => {
    expect(getStockPrediction('테스트종목')).toEqual(
      expect.objectContaining({
        symbol: '테스트종목',
        statusLabel: '중립',
        riskScore: 60,
      }),
    )
  })

  it('관심 종목은 중복 없이 추가하고 다시 누르면 제거한다', () => {
    expect(toggleWatchlist([], '삼성전자')).toEqual(['삼성전자'])
    expect(toggleWatchlist(['삼성전자'], '삼성전자')).toEqual([])
  })
})
