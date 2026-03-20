export function formatKoreanWon(value: number) {
  if (!Number.isFinite(value)) {
    return '확인 중'
  }

  const absolute = Math.abs(Math.round(value))
  const sign = value < 0 ? '-' : ''

  if (absolute < 100000000) {
    return `${sign}${absolute.toLocaleString('ko-KR')}원`
  }

  const eok = Math.floor(absolute / 100000000)
  const jo = Math.floor(eok / 10000)
  const remainEok = eok % 10000

  if (jo > 0 && remainEok > 0) {
    return `${sign}${jo.toLocaleString('ko-KR')}조 ${remainEok.toLocaleString('ko-KR')}억`
  }

  if (jo > 0) {
    return `${sign}${jo.toLocaleString('ko-KR')}조`
  }

  return `${sign}${eok.toLocaleString('ko-KR')}억`
}

export function formatSignedKoreanWon(value: number) {
  if (!Number.isFinite(value)) {
    return '확인 중'
  }

  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatKoreanWon(Math.abs(value))}`
}
