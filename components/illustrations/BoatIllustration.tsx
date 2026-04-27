'use client'

import { cn } from '@/lib/utils'

interface BoatIllustrationProps {
  healthScore?: number
  leakLabels?: string[]
  status?: 'Floating' | 'Leaking' | 'Stormy'
  className?: string
}

const statusText: Record<'Floating' | 'Leaking' | 'Stormy', string> = {
  Floating: 'Hull Sound',
  Leaking: 'Leaks Found',
  Stormy: 'Storm Watch',
}

const statusFill: Record<'Floating' | 'Leaking' | 'Stormy', string> = {
  Floating: '#4ca08f',
  Leaking: '#c6a15b',
  Stormy: '#a4493d',
}

export function BoatIllustration({
  healthScore = 82,
  leakLabels = ['Food Delivery', 'Coffee'],
  status = 'Floating',
  className,
}: BoatIllustrationProps) {
  const scoreColor = healthScore >= 80 ? '#d7bb7d' : healthScore >= 60 ? '#c6a15b' : '#a4493d'

  return (
    <div className={cn('overflow-hidden rounded-[28px]', className)}>
      <svg
        viewBox="0 0 400 284"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="captSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#20324a" />
            <stop offset="100%" stopColor="#394d5d" />
          </linearGradient>
          <linearGradient id="captSea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#163244" />
            <stop offset="100%" stopColor="#111d2d" />
          </linearGradient>
          <linearGradient id="captHull" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6f4932" />
            <stop offset="100%" stopColor="#3a2618" />
          </linearGradient>
          <linearGradient id="captSail" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2e7d2" />
            <stop offset="100%" stopColor="#d3bea0" />
          </linearGradient>
          <filter id="captGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="400" height="284" fill="#111827" />
        <rect x="0" y="0" width="400" height="164" fill="url(#captSky)" />
        <rect x="0" y="144" width="400" height="140" fill="url(#captSea)" />

        <g opacity="0.22">
          <circle cx="338" cy="44" r="30" fill="#d7bb7d" filter="url(#captGlow)" />
          <circle cx="72" cy="50" r="18" fill="#f4ead6" />
          <circle cx="96" cy="55" r="12" fill="#f4ead6" />
          <circle cx="52" cy="58" r="10" fill="#f4ead6" />
        </g>

        <g className="animate-wave-flow-slow">
          <path
            d="M0 170 C55 156 110 184 165 170 C220 156 275 184 330 170 C365 162 400 168 460 176 L460 284 L0 284 Z"
            fill="rgba(45, 99, 112, 0.35)"
          />
        </g>
        <g className="animate-wave-flow">
          <path
            d="M0 162 C42 148 96 176 150 162 C212 148 258 178 322 166 C350 160 374 154 450 166 L450 284 L0 284 Z"
            fill="rgba(111, 162, 165, 0.20)"
          />
        </g>

        <g className="animate-boat-bob" style={{ transformOrigin: '200px 190px' }}>
          <path
            d="M124 198 L282 198 L258 232 L150 232 Z"
            fill="url(#captHull)"
            stroke="#c6a15b"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M139 206 L270 206"
            stroke="rgba(243, 229, 204, 0.18)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect
            x="176"
            y="170"
            width="56"
            height="26"
            rx="6"
            fill="#1d2634"
            stroke="#c6a15b"
            strokeWidth="1.5"
          />
          <rect x="184" y="177" width="12" height="8" rx="2" fill="#6ea2a5" opacity="0.8" />
          <rect x="201" y="177" width="12" height="8" rx="2" fill="#6ea2a5" opacity="0.8" />
          <line x1="204" y1="92" x2="204" y2="198" stroke="#c6a15b" strokeWidth="3" />
          <line x1="204" y1="126" x2="248" y2="144" stroke="#c6a15b" strokeWidth="2" opacity="0.75" />

          <g className="animate-sail-flutter" style={{ transformOrigin: '204px 186px' }}>
            <polygon
              points="204,98 258,186 204,194"
              fill="url(#captSail)"
              stroke="#5c4732"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line x1="214" y1="118" x2="240" y2="160" stroke="#b69263" strokeWidth="1.2" opacity="0.7" />
            <polygon points="204,108 168,180 204,194" fill="#ddc8aa" stroke="#5c4732" strokeWidth="1.2" />
          </g>

          <polygon points="204,92 222,100 204,110" fill="#a4493d" />
          <circle cx="214" cy="102" r="2.6" fill="#f2e7d2" />
          <line x1="215" y1="101" x2="215" y2="103" stroke="#2a1b11" strokeWidth="0.7" />
          <line x1="214" y1="102" x2="216" y2="102" stroke="#2a1b11" strokeWidth="0.7" />

          <circle cx="158" cy="213" r="4.5" fill="#a4493d" className="animate-drip" />
          <circle
            cx="173"
            cy="219"
            r="3.8"
            fill="#a4493d"
            className="animate-drip"
            style={{ animationDelay: '0.7s' }}
          />

          <path
            d="M130 132 C116 126 108 118 104 106"
            stroke="#c6a15b"
            strokeWidth="1.1"
            strokeDasharray="4 4"
            fill="none"
          />
          <path
            d="M144 144 C126 142 116 138 108 130"
            stroke="#c6a15b"
            strokeWidth="1.1"
            strokeDasharray="4 4"
            fill="none"
          />
          <text x="70" y="104" fontSize="10" fill="#f2e7d2" fontFamily="Georgia, serif">
            {leakLabels[0] ?? 'Food Delivery'}
          </text>
          <text x="76" y="127" fontSize="10" fill="#f2e7d2" fontFamily="Georgia, serif">
            {leakLabels[1] ?? 'Coffee'}
          </text>
        </g>

        <rect
          x="18"
          y="18"
          width="112"
          height="32"
          rx="16"
          fill={statusFill[status]}
          opacity="0.92"
        />
        <text
          x="74"
          y="38"
          textAnchor="middle"
          fontSize="11"
          fill="#f8f3e8"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
        >
          {statusText[status]}
        </text>

        <rect x="256" y="196" width="124" height="58" rx="16" fill="rgba(18, 24, 36, 0.82)" stroke="#c6a15b" />
        <text
          x="318"
          y="219"
          textAnchor="middle"
          fontSize="10"
          fill="rgba(244, 234, 214, 0.72)"
          fontFamily="Arial, sans-serif"
          letterSpacing="1.8"
        >
          SHIP CONDITION
        </text>
        <text
          x="318"
          y="243"
          textAnchor="middle"
          fontSize="20"
          fill={scoreColor}
          fontFamily="Georgia, serif"
          fontWeight="700"
        >
          {healthScore}%
        </text>
      </svg>
    </div>
  )
}
