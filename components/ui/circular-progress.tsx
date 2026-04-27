'use client'

import { cn } from '@/lib/utils'

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

function getGradientColors(value: number): [string, string] {
  if (value >= 80) return ['#0D9488', '#38BDF8']
  if (value >= 60) return ['#F59E0B', '#EAB308']
  return ['#F97316', '#EF4444']
}

export function CircularProgress({
  value,
  size = 180,
  strokeWidth = 14,
  label,
  className,
}: CircularProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - clampedValue / 100)
  const cx = size / 2
  const cy = size / 2
  const [colorStart, colorStop] = getGradientColors(clampedValue)
  const gradientId = `progress-grad-${size}`

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="animate-ring-pulse"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorStop} />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold text-white leading-none"
          style={{ fontSize: size / 5.2 }}
        >
          {clampedValue}%
        </span>
        {label && (
          <span
            className="text-muted-foreground mt-1 font-medium"
            style={{ fontSize: size / 10 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
