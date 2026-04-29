'use client'

import { cn } from '@/lib/utils'

interface BoatIllustrationProps {
  healthScore?: number
  activeLeaksTotal?: number
  status?: 'Steady' | 'Needs Attention' | 'Urgent'
  className?: string
}

export function BoatIllustration({
  healthScore = 82,
  activeLeaksTotal = 0,
  status = 'Steady',
  className,
}: BoatIllustrationProps) {
  const statusColor =
    status === 'Steady' ? '#4ca08f' : status === 'Needs Attention' ? '#c6a15b' : '#a4493d'

  return (
    <div className={cn('relative w-full overflow-hidden will-change-transform', className)}>
      <svg
        viewBox="0 0 400 270"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
<clipPath id="hullInside">
<path d="M154 198 L258 198 L286 156 L128 156 Z" />
</clipPath>
          <linearGradient id="seaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#183041" />
            <stop offset="100%" stopColor="#101c2a" />
          </linearGradient>
          <linearGradient id="shipHull" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4b3424" />
            <stop offset="100%" stopColor="#26180f" />
          </linearGradient>
          <linearGradient id="sailLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2ead9" />
            <stop offset="100%" stopColor="#d8c5a6" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="270" fill="url(#seaGradient)" />
        <rect x="0" y="0" width="400" height="118" fill="rgba(110, 162, 165, 0.06)" />
        <circle cx="336" cy="42" r="26" fill="rgba(198, 161, 91, 0.15)" />

        <g opacity="0.16">
          <circle cx="52" cy="44" r="2" fill="#f3e5cc" />
          <circle cx="92" cy="62" r="1.4" fill="#f3e5cc" />
          <circle cx="268" cy="34" r="1.6" fill="#f3e5cc" />
          <circle cx="304" cy="78" r="1.2" fill="#f3e5cc" />
        </g>

        <g className="animate-wave-flow-slow" transform="translate(0 0)">
          <path
            d="M0 156 C28 148 56 164 84 156 C112 148 140 164 168 156 C196 148 224 164 252 156 C280 148 308 164 336 156 C364 148 392 164 420 156 C448 148 476 164 504 156 C532 148 560 164 588 156 C616 148 644 164 672 156 C700 148 728 164 756 156 C784 148 812 164 840 156 L840 270 L0 270 Z"
            fill="rgba(76,160,143,0.28)"
          />
        </g>

        <g className="animate-wave-flow" transform="translate(0 0)">
          <path
            d="M0 168 C30 158 60 176 90 168 C120 158 150 176 180 168 C210 158 240 176 270 168 C300 158 330 176 360 168 C390 158 420 176 450 168 C480 158 510 176 540 168 C570 158 600 176 630 168 C660 158 690 176 720 168 C750 158 780 176 810 168 C840 158 870 176 900 168 L900 270 L0 270 Z"
            fill="rgba(110,162,165,0.22)"
          />
        </g>

        <g className="animate-boat-bob" style={{ transformOrigin: '208px 150px' }}>
          <path
            d="M128 156 L286 156 L258 198 L154 198 Z"
            fill="url(#shipHull)"
            stroke="#c6a15b"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M142 166 L274 166"
            stroke="rgba(243, 229, 204, 0.16)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="176" y="132" width="56" height="24" rx="6" fill="#162130" stroke="#c6a15b" />
          <rect x="185" y="138" width="12" height="8" rx="2" fill="#6ea2a5" opacity="0.75" />
          <rect x="202" y="138" width="12" height="8" rx="2" fill="#6ea2a5" opacity="0.75" />
          <line x1="206" y1="66" x2="206" y2="156" stroke="#c6a15b" strokeWidth="3" />
          <g className="animate-sail-flutter" style={{ transformOrigin: '206px 148px' }}>
            <polygon points="206,72 258,148 206,154" fill="url(#sailLight)" stroke="#5d4a34" strokeWidth="1.4" />
            <polygon points="206,82 170,145 206,154" fill="#ddd1b5" stroke="#5d4a34" strokeWidth="1.2" />
          </g>
          <polygon points="206,66 223,73 206,82" fill="#a4493d" />
<g clipPath="url(#hullInside)">
<rect x="120" y={198 - (42 * Math.min(activeLeaksTotal / 2500, 1))} width="180" height="42" fill="#6ea2a5" opacity={0.5 + (0.3 * Math.min(activeLeaksTotal / 2500, 1))} />
</g>
        </g>

        <g>
          <rect x="18" y="18" width="118" height="30" rx="15" fill="rgba(16,28,42,0.65)" stroke={statusColor} />
          <text x="77" y="37" fill={statusColor} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif">
            {status === 'Steady' ? 'Hull steady' : status === 'Needs Attention' ? 'Leaks flagged' : 'Storm pressure'}
          </text>
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-4 right-3 rounded-full border border-brass/18 bg-ink/65 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brass">
        Ship condition {healthScore}%
      </div>
    </div>
  )
}
