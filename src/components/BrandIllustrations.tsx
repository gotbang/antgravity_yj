import type { ReactNode, SVGProps } from 'react'

type IconShellProps = {
  children: ReactNode
  gradient: string
  stroke?: string
}

function IconShell({ children, gradient, stroke = '#42517a' }: IconShellProps) {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eef7ff" />
          <stop offset="100%" stopColor="#b2cdf9" />
        </linearGradient>
      </defs>
      <rect x="7" y="7" width="58" height="58" rx="18" fill={`url(#${gradient})`} />
      <rect x="7" y="7" width="58" height="58" rx="18" fill="none" stroke="rgba(66,81,122,0.18)" />
      <g stroke={stroke} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  )
}

export function AntMascotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 88 88" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="antBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3fbff" />
          <stop offset="100%" stopColor="#d7e8ff" />
        </linearGradient>
        <linearGradient id="antHead" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7a84a6" />
          <stop offset="100%" stopColor="#313b61" />
        </linearGradient>
        <linearGradient id="antBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#626c8f" />
          <stop offset="100%" stopColor="#202949" />
        </linearGradient>
      </defs>

      <circle cx="44" cy="44" r="40" fill="url(#antBg)" />
      <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(29,39,71,0.12)" />
      <ellipse cx="30" cy="24" rx="18" ry="10" fill="rgba(255,255,255,0.32)" />

      <g stroke="#314067" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M34 18c-6-9-16-7-17 3" />
        <path d="M54 18c6-9 16-7 17 3" />
        <path d="M32 18c2 2 4 6 4 10" />
        <path d="M56 18c-2 2-4 6-4 10" />
        <path d="M17 56c7-6 12-5 18-1" />
        <path d="M53 55c7-5 12-4 18 2" />
        <path d="M22 64c7-2 11 1 14 6" />
        <path d="M52 69c3-5 7-7 14-6" />
      </g>

      <g fill="url(#antBody)" stroke="#314067" strokeWidth="1.8">
        <ellipse cx="42" cy="58" rx="18" ry="16" />
        <ellipse cx="44" cy="38" rx="14" ry="12" fill="url(#antHead)" />
        <ellipse cx="48" cy="73" rx="12" ry="9" />
      </g>

      <g fill="none" stroke="#314067" strokeWidth="2.4" strokeLinecap="round">
        <path d="M33 72c-4 5-8 8-14 9" />
        <path d="M36 77c-2 4-3 6-2 10" />
        <path d="M58 74c5 4 9 7 15 8" />
        <path d="M55 79c2 4 3 6 2 9" />
      </g>

      <g fill="#ffffff">
        <circle cx="38.5" cy="38" r="6.2" />
        <circle cx="50.5" cy="38" r="6.2" />
      </g>
      <g fill="#293350">
        <circle cx="40" cy="39" r="2.9" />
        <circle cx="49" cy="39" r="2.9" />
      </g>
      <g fill="#ffd0dc">
        <circle cx="31" cy="46" r="3.4" />
        <circle cx="58" cy="46" r="3.4" />
      </g>
      <circle cx="57" cy="32" r="2.8" fill="#ffffff" opacity="0.9" />
      <path
        d="M39 48c2 3 8 3 10 0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TodayIcon() {
  return (
    <IconShell gradient="todayGradient">
      <rect x="19" y="18" width="24" height="28" rx="6" fill="rgba(255,255,255,0.5)" />
      <path d="M30 44l14-15" />
      <path d="M35 29h9v9" />
      <path d="M22 49h13" />
    </IconShell>
  )
}

export function AnalysisIcon() {
  return (
    <IconShell gradient="analysisGradient">
      <rect x="18" y="44" width="8" height="10" rx="2.5" fill="#ffcf73" />
      <rect x="31" y="30" width="8" height="24" rx="2.5" fill="#ff8d8d" />
      <rect x="44" y="21" width="8" height="33" rx="2.5" fill="#99df8d" />
      <path d="M16 56h40" />
    </IconShell>
  )
}

export function DiaryIcon() {
  return (
    <IconShell gradient="diaryGradient">
      <path d="M22 21h22c5 0 8 3 8 8v23H30c-4 0-8-3-8-8V21z" fill="rgba(255,255,255,0.52)" />
      <path d="M22 21h22c5 0 8 3 8 8v23H30c-4 0-8-3-8-8V21z" />
      <path d="M30 29h14" />
      <path d="M30 35h14" />
      <path d="M30 41h10" />
      <path d="M48 27c4 0 7 3 7 7 0 6-7 9-9 11-2-2-9-5-9-11 0-4 3-7 7-7 2 0 3 1 4 2 1-1 2-2 4-2z" fill="#ff9eb3" stroke="#42517a" />
    </IconShell>
  )
}
