'use client'

import { cn } from '@/lib/utils'

interface IslandMapProps {
  progressPercent: number
  goalName: string
  amountRemaining: number
  className?: string
}

export function IslandMap({
  progressPercent,
  goalName,
  amountRemaining,
  className,
}: IslandMapProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercent))
  const markerX = 64 + (clampedProgress / 100) * 190
  const fontFamily = 'var(--font-sans), ui-sans-serif, system-ui, sans-serif'

  return (
    <div className={cn('overflow-hidden rounded-[28px] pirate-note', className)}>
      <svg
        viewBox="0 0 360 200"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="0" width="360" height="200" fill="#e5d1b2" />
        <rect x="10" y="10" width="340" height="180" rx="18" fill="#ecdcc0" stroke="#b69263" strokeWidth="1.5" />

        <path
          d="M0 130 C42 118 84 146 122 134 C166 122 196 144 240 132 C282 120 316 136 360 126 L360 200 L0 200 Z"
          fill="#8aa0a5"
          opacity="0.34"
        />
        <path
          d="M0 140 C42 128 84 156 122 144 C166 132 196 154 240 142 C282 130 316 146 360 136 L360 200 L0 200 Z"
          fill="#49606a"
          opacity="0.24"
        />

        <g opacity="0.22">
          <circle cx="54" cy="42" r="22" fill="#b69263" />
          <line x1="54" y1="18" x2="54" y2="66" stroke="#7c6040" strokeWidth="1.2" />
          <line x1="30" y1="42" x2="78" y2="42" stroke="#7c6040" strokeWidth="1.2" />
          <line x1="37" y1="25" x2="71" y2="59" stroke="#7c6040" strokeWidth="1.2" />
          <line x1="71" y1="25" x2="37" y2="59" stroke="#7c6040" strokeWidth="1.2" />
        </g>

        <path
          d="M64 136 C108 126 150 128 190 124 C224 120 252 116 274 102"
          fill="none"
          stroke="#7c6040"
          strokeWidth="2"
          strokeDasharray="5 6"
        />
        <path
          d="M64 136 C96 128 134 129 162 126 C196 123 221 119 248 110"
          fill="none"
          stroke="#b69263"
          strokeWidth="2.5"
        />

        <g transform={`translate(${markerX - 12}, 120)`}>
          <path d="M4 14 L22 14 L20 20 L6 20 Z" fill="#5f3b25" stroke="#302013" strokeWidth="1.1" />
          <line x1="12" y1="1" x2="12" y2="14" stroke="#3f2b1c" strokeWidth="1.3" />
          <polygon points="12,2 20,11 12,13" fill="#f1e3cb" stroke="#7c6040" strokeWidth="0.9" />
        </g>

        <g transform="translate(274 76)">
          <ellipse cx="28" cy="24" rx="40" ry="18" fill="#d3bb8f" />
          <ellipse cx="28" cy="18" rx="30" ry="12" fill="#7e8f59" />
          <path d="M28 4 C32 16 32 22 29 30" stroke="#6b4a2f" strokeWidth="3" fill="none" />
          <line x1="29" y1="8" x2="44" y2="0" stroke="#7e8f59" strokeWidth="3" strokeLinecap="round" />
          <line x1="29" y1="8" x2="46" y2="10" stroke="#7e8f59" strokeWidth="3" strokeLinecap="round" />
          <line x1="29" y1="8" x2="18" y2="-2" stroke="#7e8f59" strokeWidth="3" strokeLinecap="round" />
        </g>

        <line x1="306" y1="108" x2="320" y2="122" stroke="#a4493d" strokeWidth="3" />
        <line x1="320" y1="108" x2="306" y2="122" stroke="#a4493d" strokeWidth="3" />

        <text x="24" y="28" fontSize="11" fill="#7c6040" fontFamily={fontFamily} letterSpacing="2">
          TREASURE CHART
        </text>
        <text x="302" y="150" textAnchor="middle" fontSize="13" fill="#2a2117" fontFamily={fontFamily} fontWeight="700">
          {goalName}
        </text>
        <text x="302" y="165" textAnchor="middle" fontSize="10" fill="#6b5a44" fontFamily={fontFamily}>
          P{amountRemaining.toLocaleString()} still to recover
        </text>
        <text x={markerX} y="158" textAnchor="middle" fontSize="10" fill="#7c6040" fontFamily={fontFamily} fontWeight="700">
          {clampedProgress}%
        </text>
      </svg>
    </div>
  )
}
