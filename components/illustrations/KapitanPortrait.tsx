'use client'

import { cn } from '@/lib/utils'

interface KapitanIllustrationProps {
  className?: string
}

function KapitanCore() {
  return (
    <>
      <path d="M40 60 C46 34 60 20 80 20 C100 20 114 34 120 60 L110 62 C106 44 96 32 80 32 C64 32 54 44 50 62 Z" fill="#0a1422" />
      <path d="M46 58 C54 40 66 30 80 30 C94 30 106 40 114 58 L106 60 C100 48 92 42 80 42 C68 42 60 48 54 60 Z" fill="#10243f" />
      <path d="M40 60 L80 24 L120 60 L112 64 C102 58 92 54 80 54 C68 54 58 58 48 64 Z" fill="#101927" />
      <path d="M40 66 C48 60 60 58 80 58 C100 58 112 60 120 66" stroke="#0a1423" strokeWidth="12" strokeLinecap="round" fill="none" />
      <rect x="40" y="61" width="80" height="12" rx="6" fill="#d0a84f" />
      <circle cx="80" cy="67" r="7" fill="#11253a" />
      <circle cx="80" cy="67" r="9" stroke="#e0c171" strokeWidth="3" fill="none" />

      <circle cx="80" cy="88" r="28" fill="#d8a277" />
      <path d="M58 80 C64 74 70 72 74 74" stroke="#4a2e22" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M86 74 C90 72 96 74 102 80" stroke="#4a2e22" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="70" cy="90" r="5.5" fill="#102338" />
      <circle cx="90" cy="90" r="5.5" fill="#102338" />
      <path d="M80 92 L72 116 C76 122 84 122 88 116 L80 92 Z" fill="#2d1913" />
      <path d="M62 118 C68 124 92 124 98 118" stroke="#7c5948" strokeWidth="5" strokeLinecap="round" fill="none" />

      <path d="M52 112 C58 106 66 102 80 102 C94 102 102 106 108 112 L118 160 L42 160 Z" fill="#132033" />
      <path d="M80 104 L68 160 L92 160 Z" fill="#efe1ce" />
    </>
  )
}

export function KapitanPortrait({ className }: KapitanIllustrationProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-[2rem]', className)}>
      <svg
        viewBox="0 0 360 420"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="360" height="420" rx="32" fill="#111e33" />
        <circle cx="102" cy="108" r="92" fill="#29586b" opacity="0.26" />
        <circle cx="302" cy="70" r="50" fill="#6e6b58" opacity="0.28" />
        <circle cx="188" cy="286" r="126" fill="#20324a" opacity="0.82" />
        <path d="M0 374 L110 296 L250 296 L360 374 L360 420 L0 420 Z" fill="#0d1728" />
        <g transform="translate(96 22) scale(1.04)">
          <KapitanCore />
        </g>
        <path
          d="M120 328 C142 368 162 392 180 404 C198 392 218 368 240 328"
          stroke="#a38a56"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M138 334 C154 346 168 352 180 352 C192 352 206 346 222 334"
          stroke="#b89d64"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

function AvatarBackground() {
  return (
    <>
      <rect width="160" height="160" rx="80" fill="#111e33" />
      <circle cx="42" cy="36" r="26" fill="#29586b" opacity="0.24" />
      <circle cx="122" cy="22" r="18" fill="#6e6b58" opacity="0.26" />
      <circle cx="80" cy="92" r="52" fill="#20324a" opacity="0.9" />
      <circle cx="80" cy="80" r="78" stroke="#7f6b3e" strokeOpacity="0.45" fill="none" />
    </>
  )
}

function AvatarPortrait() {
  return <KapitanCore />
}

export function KapitanAvatar({ className }: KapitanIllustrationProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-full', className)}>
      <svg
        viewBox="0 0 160 160"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <AvatarBackground />
        <AvatarPortrait />
      </svg>
    </div>
  )
}
