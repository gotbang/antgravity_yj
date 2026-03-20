import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

describe('app routes', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('홈 화면을 렌더링한다', async () => {
    renderAt('/')

    expect(await screen.findByRole('heading', { name: /오늘의 주식 시장 방향/ })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /내 관심종목/ })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /모델 신뢰도/ })).toBeInTheDocument()
  })

  it('종목 목록 화면을 렌더링한다', async () => {
    renderAt('/stock')

    expect(await screen.findByRole('heading', { name: /종목 검색/ })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /인기 종목/ })).toBeInTheDocument()
  })

  it('예측 상세 화면을 렌더링한다', async () => {
    renderAt('/stock/삼성전자')

    expect(await screen.findByText('방향 예상 (5일)')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /판단 근거/ })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /데이터 믹스/ })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /예측 히스토리/ })).toBeInTheDocument()
  })

  it('시장 감정 화면을 렌더링한다', async () => {
    renderAt('/emotion')

    expect(await screen.findByRole('heading', { name: /오늘의 시장 감정/ })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /투자자 심리 지표/ })).toBeInTheDocument()
  })

  it('일기 화면을 렌더링한다', async () => {
    renderAt('/diary')

    expect(await screen.findByText('오늘의 일기')).toBeInTheDocument()
    expect(await screen.findByText('커뮤니티 다이어리')).toBeInTheDocument()
  })

  it('저널 화면을 렌더링한다', async () => {
    renderAt('/journal')

    expect(await screen.findByText('월간 감정 그래프')).toBeInTheDocument()
    expect(await screen.findByText('매매 일지')).toBeInTheDocument()
  })
})
