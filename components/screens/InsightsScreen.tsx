'use client'

import { useState } from 'react'
import { Plus, Star, CheckCircle2 } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { CircularProgress } from '@/components/ui/circular-progress'
import type { Goal } from '@/types'

interface IslandScreenProps {
  goals: Goal[]
  prioritizeGoal: (id: string) => void
}

// Island positions on the SVG map (viewBox 0 0 400 520, boat at y=450)
// Closer islands = higher progress. x positions spread across the map.
const ISLAND_POSITIONS: Record<string, { cx: number; cy: number }> = {
  '1': { cx: 195, cy: 290 }, // Emergency Reserve 64% — near center
  '2': { cx: 218, cy: 85  }, // Tuition 24% — far center
  '3': { cx: 305, cy: 195 }, // New Phone 36% — mid right
  '4': { cx: 100, cy: 175 }, // Debt Payoff 33% — mid left
}

function getIslandPos(id: string) {
  return ISLAND_POSITIONS[id] ?? { cx: 200, cy: 200 }
}

function IslandSVG({
  goals,
  onSelectGoal,
}: {
  goals: Goal[]
  onSelectGoal: (goal: Goal) => void
}) {
  const priorityGoal = goals.find(g => g.isPriority)

  return (
    <svg
      viewBox="0 0 400 520"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mapOceanFull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3347" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <radialGradient id="islandGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c6a15b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c6a15b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ocean background */}
      <rect x="0" y="0" width="400" height="520" fill="url(#mapOceanFull)" />

      {/* Subtle wave lines */}
      <g opacity="0.12">
        {[80, 150, 220, 310, 400, 470].map((y, i) => (
          <path
            key={i}
            d={`M0,${y} Q100,${y - 8} 200,${y} Q300,${y + 8} 400,${y}`}
            fill="none"
            stroke="#6ea2a5"
            strokeWidth="1"
          />
        ))}
      </g>

      {/* Route lines from boat to each island */}
      {goals.map(goal => {
        const pos = getIslandPos(goal.id)
        const isPriority = goal.isPriority
        return (
          <line
            key={`route-${goal.id}`}
            x1="200" y1="440"
            x2={pos.cx} y2={pos.cy + 20}
            stroke={isPriority ? '#c6a15b' : 'rgba(255,255,255,0.12)'}
            strokeWidth={isPriority ? 1.8 : 1}
            strokeDasharray={isPriority ? '8 5' : '4 6'}
          />
        )
      })}

      {/* Islands */}
      {goals.map(goal => {
        const pos = getIslandPos(goal.id)
        const progress = goal.savedAmount / goal.targetAmount
        const isPriority = goal.isPriority

        return (
          <g
            key={goal.id}
            onClick={() => onSelectGoal(goal)}
            style={{ cursor: 'pointer' }}
          >
            {/* Tap hit area */}
            <circle cx={pos.cx} cy={pos.cy} r={52} fill="transparent" />

            {/* Priority glow */}
            {isPriority && (
              <circle cx={pos.cx} cy={pos.cy + 5} r={44} fill="url(#islandGlow)" />
            )}

            {/* Ocean shimmer around island */}
            <ellipse cx={pos.cx} cy={pos.cy + 16} rx={36} ry={13} fill="rgba(110,162,165,0.25)" />

            {/* Sand base */}
            <ellipse cx={pos.cx} cy={pos.cy + 12} rx={30} ry={12} fill="#d3bb8f" />

            {/* Grass */}
            <ellipse cx={pos.cx} cy={pos.cy + 4} rx={20} ry={9} fill="#7e8f59" />

            {/* Palm trunk */}
            <path
              d={`M${pos.cx} ${pos.cy - 8} C${pos.cx + 3} ${pos.cy + 1} ${pos.cx + 2} ${pos.cy + 7} ${pos.cx} ${pos.cy + 13}`}
              stroke="#6b4a2f"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Palm fronds */}
            {[
              [pos.cx, pos.cy - 8, pos.cx + 14, pos.cy - 16],
              [pos.cx, pos.cy - 8, pos.cx + 15, pos.cy - 6],
              [pos.cx, pos.cy - 8, pos.cx + 6, pos.cy - 20],
              [pos.cx, pos.cy - 8, pos.cx - 13, pos.cy - 14],
              [pos.cx, pos.cy - 8, pos.cx - 14, pos.cy - 5],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7e8f59" strokeWidth="2.2" strokeLinecap="round" />
            ))}

            {/* Priority flag */}
            {isPriority && (
              <>
                <line x1={pos.cx + 16} y1={pos.cy - 18} x2={pos.cx + 16} y2={pos.cy - 4} stroke="#a4493d" strokeWidth="1.8" />
                <polygon points={`${pos.cx + 16},${pos.cy - 18} ${pos.cx + 26},${pos.cy - 13} ${pos.cx + 16},${pos.cy - 8}`} fill="#a4493d" />
              </>
            )}

            {/* Progress ring outline */}
            <circle
              cx={pos.cx}
              cy={pos.cy}
              r={35}
              fill="none"
              stroke={isPriority ? 'rgba(198,161,91,0.35)' : 'rgba(255,255,255,0.08)'}
              strokeWidth="1.5"
            />

            {/* Goal name */}
            <text
              x={pos.cx}
              y={pos.cy + 32}
              textAnchor="middle"
              fontSize="9.5"
              fill={isPriority ? '#c6a15b' : '#f4ead6'}
              fontFamily="Georgia, serif"
              fontWeight={isPriority ? '700' : '400'}
            >
              {goal.name}
            </text>

            {/* Progress % */}
            <text
              x={pos.cx}
              y={pos.cy + 45}
              textAnchor="middle"
              fontSize="8.5"
              fill="#6ea2a5"
              fontFamily="Arial, sans-serif"
            >
              {Math.round(progress * 100)}%
            </text>
          </g>
        )
      })}

      {/* Boat at bottom */}
      <g transform="translate(186, 424)">
        {/* Hull */}
        <path d="M4 16 L24 16 L21 23 L7 23 Z" fill="#5f3b25" stroke="#c6a15b" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Cabin */}
        <rect x="10" y="10" width="10" height="7" rx="2" fill="#1d2634" stroke="#c6a15b" strokeWidth="1" />
        {/* Mast */}
        <line x1="14" y1="1" x2="14" y2="13" stroke="#c6a15b" strokeWidth="1.5" />
        {/* Sail */}
        <polygon points="14,2 22,12 14,14" fill="#f2e7d2" stroke="#5c4732" strokeWidth="1" strokeLinejoin="round" />
        {/* Flag */}
        <polygon points="14,1 20,5 14,9" fill="#a4493d" />
      </g>

      {/* "You are here" label */}
      <text x="200" y="475" textAnchor="middle" fontSize="9" fill="rgba(244,234,214,0.5)" fontFamily="Arial, sans-serif" letterSpacing="1.5">
        YOU ARE HERE
      </text>

      {/* Compass rose - top right */}
      <g transform="translate(360, 44)" opacity="0.35">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#c6a15b" strokeWidth="1" />
        <line x1="0" y1="-14" x2="0" y2="14" stroke="#c6a15b" strokeWidth="1" />
        <line x1="-14" y1="0" x2="14" y2="0" stroke="#c6a15b" strokeWidth="1" />
        <text x="0" y="-17" textAnchor="middle" fontSize="7" fill="#c6a15b" fontFamily="Georgia, serif">N</text>
      </g>
    </svg>
  )
}

function GoalDetailSheet({
  goal,
  onPrioritize,
}: {
  goal: Goal
  onPrioritize: () => void
}) {
  const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100)
  const remaining = goal.targetAmount - goal.savedAmount
  const weeksToComplete = Math.ceil(remaining / goal.weeklyContribution)
  const arrivalDate = new Date()
  arrivalDate.setDate(arrivalDate.getDate() + weeksToComplete * 7)
  const arrival = arrivalDate.toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })

  return (
    <div className="space-y-5 px-1 pb-2">
      {/* Drag handle */}
      <div className="flex justify-center pt-1 pb-2">
        <div className="h-1 w-10 rounded-full bg-brass/25" />
      </div>

      {/* Goal header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brass/35 bg-wood text-2xl">
          {goal.icon === 'Anchor' ? '⚓' :
           goal.icon === 'Scroll' ? '📜' :
           goal.icon === 'Gem' ? '💎' :
           goal.icon === 'Shield' ? '🛡️' : '🏝️'}
        </div>
        <div>
          <p className="pirate-kicker">Destination island</p>
          <h2 className="font-display text-2xl font-semibold text-bone">{goal.name}</h2>
        </div>
      </div>

      {/* Circular progress */}
      <div className="flex items-center gap-5">
        <CircularProgress value={progress} size={100} strokeWidth={10} label={`${progress}%`} />
        <div className="space-y-2">
          <div>
            <p className="pirate-kicker">Secured</p>
            <p className="font-display text-xl font-semibold text-bone">₱{goal.savedAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="pirate-kicker">Target</p>
            <p className="font-display text-lg font-semibold text-sand/70">₱{goal.targetAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Timeline projection */}
      <div className="rounded-[20px] pirate-note p-4 space-y-1">
        <p className="pirate-kicker text-ink/60">Voyage timeline</p>
        <p className="font-display text-xl font-semibold text-ink">
          ~{arrival} <span className="text-base font-normal text-ink/60">({weeksToComplete} weeks)</span>
        </p>
        <p className="text-sm text-ink/70">
          At ₱{goal.weeklyContribution.toLocaleString()}/week · ₱{remaining.toLocaleString()} remaining
        </p>
      </div>

      {/* Priority button */}
      {goal.isPriority ? (
        <div className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[20px] border border-teal/30 bg-teal/10 py-4 text-sm font-bold uppercase tracking-[0.16em] text-teal">
          <CheckCircle2 className="h-5 w-5" />
          Priority Island
        </div>
      ) : (
        <button
          onClick={onPrioritize}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(180deg,rgba(198,161,91,0.95),rgba(132,91,39,0.96))] py-4 text-sm font-bold uppercase tracking-[0.16em] text-ink shadow-lg shadow-black/25 active:scale-95 transition-transform"
        >
          <Star className="h-5 w-5" />
          Set as Priority Island
        </button>
      )}
    </div>
  )
}

export function IslandScreen({ goals, prioritizeGoal }: IslandScreenProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const selectedGoal = goals.find(g => g.id === selectedGoalId)
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const overallPct = Math.round((totalSaved / totalTarget) * 100)

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoalId(goal.id)
    setSheetOpen(true)
  }

  const handlePrioritize = (id: string) => {
    prioritizeGoal(id)
    setSheetOpen(false)
  }

  return (
    <div className="min-h-screen bg-navy pb-28 pirate-page">
      {/* Summary bar */}
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <p className="pirate-kicker">Treasure voyage</p>
          <h1 className="font-display text-3xl font-semibold text-bone">All islands</h1>
          <p className="text-sm text-sand/65">Tap any island to explore it</p>
        </div>
        <div className="text-right">
          <p className="pirate-kicker">Total secured</p>
          <p className="font-display text-2xl font-bold text-brass">₱{totalSaved.toLocaleString()}</p>
          <p className="text-xs text-teal">{overallPct}% of all goals</p>
        </div>
      </div>

      {/* Scrollable island map */}
      <div className="overflow-y-auto px-4" style={{ maxHeight: 'calc(100vh - 260px)' }}>
        <div className="rounded-[28px] overflow-hidden border border-brass/20" style={{ background: 'linear-gradient(180deg,#1a3347,#111827)' }}>
          <IslandSVG goals={goals} onSelectGoal={handleSelectGoal} />
        </div>

        {/* Goal cards below map */}
        <div className="mt-4 space-y-3">
          <div className="px-1">
            <p className="pirate-kicker">All destinations</p>
            <h2 className="font-display text-2xl font-semibold text-bone">Active routes</h2>
          </div>

          {goals.map(goal => {
            const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100)
            const remaining = goal.targetAmount - goal.savedAmount
            const weeks = Math.ceil(remaining / goal.weeklyContribution)

            return (
              <button
                key={goal.id}
                onClick={() => handleSelectGoal(goal)}
                className={`w-full rounded-[28px] p-5 text-left transition-transform active:scale-[0.98] ${
                  goal.isPriority ? 'border border-brass/40 pirate-panel' : 'pirate-panel'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {goal.isPriority && <Star className="h-4 w-4 text-brass flex-shrink-0" />}
                    <div>
                      {goal.isPriority && <p className="pirate-kicker">Priority route</p>}
                      <h3 className="font-display text-xl font-semibold text-bone">{goal.name}</h3>
                      <p className="text-xs text-sand/60">~{weeks} weeks at ₱{goal.weeklyContribution.toLocaleString()}/wk</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-2xl font-bold text-brass">{progress}%</p>
                    <p className="text-xs text-sand/55">₱{remaining.toLocaleString()} to go</p>
                  </div>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-wood/30">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: goal.isPriority
                        ? 'linear-gradient(90deg,#c6a15b,#d7bb7d)'
                        : 'linear-gradient(90deg,#4ca08f,#6ea2a5)',
                    }}
                  />
                </div>
              </button>
            )
          })}

          <button className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[28px] border border-dashed border-brass/30 bg-wood-light/30 py-5 text-sm font-semibold uppercase tracking-[0.18em] text-brass">
            <Plus className="h-5 w-5" />
            Add new destination
          </button>
        </div>
      </div>

      {/* Goal detail bottom sheet */}
      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent className="border-t border-brass/25 bg-navy px-4 pb-safe pirate-page" style={{ maxHeight: '80vh' }}>
          <DrawerTitle className="sr-only">
            {selectedGoal ? `${selectedGoal.name} — Island Details` : 'Island Details'}
          </DrawerTitle>
          {selectedGoal && (
            <GoalDetailSheet
              goal={selectedGoal}
              onPrioritize={() => handlePrioritize(selectedGoal.id)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
