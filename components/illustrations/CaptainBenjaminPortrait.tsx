'use client'

import { cn } from '@/lib/utils'

interface CaptainBenjaminPortraitProps {
  className?: string
  compact?: boolean
}

export function CaptainBenjaminPortrait({
  className,
  compact = false,
}: CaptainBenjaminPortraitProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-[2rem]', className)}>
      <svg
        viewBox="0 0 360 420"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="captain-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#163042" />
            <stop offset="50%" stopColor="#111f30" />
            <stop offset="100%" stopColor="#0b1520" />
          </linearGradient>
          <linearGradient id="captain-coat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#243647" />
            <stop offset="100%" stopColor="#101b29" />
          </linearGradient>
          <linearGradient id="captain-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d7bb7d" />
            <stop offset="100%" stopColor="#b88c3a" />
          </linearGradient>
        </defs>

        <rect width="360" height="420" rx="32" fill="url(#captain-bg)" />
        <circle cx="102" cy="92" r="84" fill="rgba(76,160,143,0.12)" />
        <circle cx="286" cy="72" r="54" fill="rgba(198,161,91,0.14)" />
        <path
          d="M36 338 C96 286 152 272 190 278 C232 284 292 312 336 374 L336 420 L24 420 Z"
          fill="rgba(18,30,45,0.72)"
        />

        <g transform={compact ? 'translate(22 38) scale(0.86)' : 'translate(0 0)'}>
          <ellipse cx="182" cy="282" rx="112" ry="102" fill="url(#captain-coat)" />
          <path
            d="M112 224 C124 170 154 142 182 142 C210 142 242 170 252 224 L236 236 C226 192 208 176 182 176 C156 176 138 192 128 236 Z"
            fill="#0d1623"
          />
          <path
            d="M122 236 C146 208 164 196 182 196 C200 196 220 208 242 236 L232 316 C214 330 202 336 182 336 C162 336 146 330 132 316 Z"
            fill="#f0ddc4"
          />
          <path
            d="M132 162 C132 124 154 94 182 94 C210 94 232 124 232 162 L232 198 C232 232 208 258 182 258 C156 258 132 232 132 198 Z"
            fill="#d2a57e"
          />
          <path
            d="M142 192 C150 168 164 156 182 156 C200 156 214 168 222 192 C212 180 198 174 182 174 C166 174 152 180 142 192 Z"
            fill="#5b3726"
            opacity="0.48"
          />
          <path
            d="M152 210 C154 204 160 202 166 204"
            stroke="#2b1a14"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M198 204 C204 202 210 204 212 210"
            stroke="#2b1a14"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="168" cy="212" r="6" fill="#122131" />
          <circle cx="196" cy="212" r="6" fill="#122131" />
          <path
            d="M182 216 L178 230 C180 232 184 232 186 230"
            stroke="#9c6c50"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M166 242 C174 248 190 248 198 242"
            stroke="#7e4039"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M140 156 C140 114 162 84 196 84 C214 84 228 92 240 108 C252 126 256 144 256 164 C248 146 236 138 222 136 C212 124 200 118 184 118 C166 118 152 126 142 140 Z"
            fill="#162130"
          />
          <path
            d="M126 140 C124 118 130 100 142 88 C154 76 170 70 188 70 C222 70 250 92 260 128 C246 110 228 102 206 102 C180 102 156 114 140 134 Z"
            fill="#101922"
          />
          <path
            d="M108 138 C126 110 150 92 184 92 C222 92 248 112 266 140 L244 150 C230 128 208 116 182 116 C156 116 136 126 122 148 Z"
            fill="#182635"
          />
          <path
            d="M102 134 L180 86 L258 134 L236 152 C216 136 198 128 180 128 C162 128 144 136 124 152 Z"
            fill="#0d1723"
          />
          <rect x="104" y="132" width="156" height="18" rx="9" fill="url(#captain-gold)" />
          <circle cx="184" cy="141" r="11" fill="#0f1b27" stroke="#d7bb7d" strokeWidth="4" />
          <path
            d="M146 264 C160 280 172 286 182 286 C194 286 206 280 220 264"
            stroke="#f0ddc4"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M118 306 C138 284 152 274 182 274 C212 274 226 284 246 306 L232 384 L132 384 Z"
            fill="#152434"
          />
          <path
            d="M180 274 L166 384 L198 384 Z"
            fill="#e9d4ba"
          />
          <path
            d="M118 306 C124 338 142 370 180 386 C218 370 236 338 246 306 L266 314 C252 358 222 392 180 406 C138 392 108 358 98 314 Z"
            fill="rgba(198,161,91,0.12)"
          />
          <path
            d="M132 320 C148 330 166 336 182 336 C198 336 216 330 232 320"
            stroke="#c6a15b"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>
      </svg>
    </div>
  )
}
