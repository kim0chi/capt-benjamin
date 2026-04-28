'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AppState, DemoOnboardingAnswers, Goal, SavingsAllocation, SavingsEntry } from '@/types'

const STORAGE_KEY = 'capt-benjamin-state'

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function createInitialState(): AppState {
  return {
    userProfile: {
      name: 'Marisol',
      role: 'Daily earner',
      incomeCadence: 'Every day',
    },
    currentBalance: 8450,
    monthlyIncome: 22000,
    monthlyExpenses: 16800,
    safeToSpend: 380,
    daysUntilPayday: 5,
    leaks: [
      {
        id: '1',
        category: 'Sari-sari Snacks',
        amount: 560,
        frequency: 'Daily',
        aiExplanation:
          'Small purchases at the corner store add up fast. Bringing packed merienda three times a week would patch this leak and save around P240 monthly.',
        icon: 'Utensils',
        color: 'border-coral',
      },
      {
        id: '2',
        category: 'Load & Data',
        amount: 320,
        frequency: 'Weekly',
        aiExplanation:
          'Data reloads are happening more often than the registered plan allows. Switching to a monthly promo saves roughly P80 per week.',
        icon: 'Signal',
        color: 'border-brass',
      },
      {
        id: '3',
        category: 'Pasalubong',
        amount: 180,
        frequency: 'Weekly',
        aiExplanation:
          'Treat purchases for family are generous but inconsistent in size. Setting a fixed P100 pasalubong budget keeps goodwill without surprising the ledger.',
        icon: 'Gift',
        color: 'border-sky',
      },
    ],
    goals: [
      {
        id: '1',
        name: 'Emergency Reserve',
        savedAmount: 5800,
        targetAmount: 10000,
        weeklyContribution: 400,
        icon: 'Anchor',
        color: 'from-brass to-sand',
        isPriority: true,
      },
      {
        id: '2',
        name: "Anak's Tuition",
        savedAmount: 9500,
        targetAmount: 35000,
        weeklyContribution: 600,
        icon: 'Scroll',
        color: 'from-sky to-teal',
      },
      {
        id: '3',
        name: 'RAFI Loan Payoff',
        savedAmount: 4200,
        targetAmount: 12000,
        weeklyContribution: 500,
        icon: 'Shield',
        color: 'from-coral to-oxblood',
      },
      {
        id: '4',
        name: 'Palengke Capital',
        savedAmount: 1500,
        targetAmount: 8000,
        weeklyContribution: 250,
        icon: 'Gem',
        color: 'from-teal to-sky',
      },
    ],
    storms: [
      {
        id: '1',
        name: 'Electric Bill',
        dueDate: '2026-04-29',
        amount: 1650,
        daysUntilDue: 1,
        priority: 'critical',
        icon: 'Bolt',
      },
      {
        id: '2',
        name: 'RAFI Loan Payment',
        dueDate: '2026-05-01',
        amount: 2200,
        daysUntilDue: 3,
        priority: 'high',
        icon: 'Landmark',
      },
      {
        id: '3',
        name: 'Internet / WiFi',
        dueDate: '2026-05-03',
        amount: 999,
        daysUntilDue: 5,
        priority: 'medium',
        icon: 'Signal',
      },
    ],
    boatHealth: {
      overallScore: 78,
      status: 'Floating',
      categories: [
        {
          label: 'Cash Flow',
          score: 84,
          color: '#4ca08f',
          description: 'Income covers daily needs with a small buffer for savings.',
        },
        {
          label: 'Bills Preparedness',
          score: 70,
          color: '#c6a15b',
          description: 'Electric bill is due tomorrow. Set it aside now before spending.',
        },
        {
          label: 'Recurring Leaks',
          score: 65,
          color: '#a4493d',
          description: 'Daily snack and load spending are the main holes in the hull.',
        },
        {
          label: 'Savings Voyage',
          score: 88,
          color: '#d7bb7d',
          description: 'Emergency Reserve and tuition are both on track.',
        },
        {
          label: 'Risk Watch',
          score: 82,
          color: '#6ea2a5',
          description: 'No unusual transactions flagged this week.',
        },
      ],
      aiInsight:
        "The ship is sailing well for a daily earner. Pay tomorrow's electric bill first, then patch the snack leak. Those two moves alone would lift your score by 8 points.",
      recommendations: [
        'Set aside P1,650 for the electric bill before any other spending today.',
        'Pack merienda three times this week to cut the sari-sari leak by P240.',
        'Add P100 to RAFI Loan Payoff each week. You are 35% there already.',
      ],
    },
    transactions: [
      {
        id: '1',
        type: 'expense',
        category: 'Sari-sari Snacks',
        amount: 85,
        date: '2026-04-27',
        description: 'Afternoon merienda',
        icon: 'Utensils',
      },
      {
        id: '2',
        type: 'income',
        category: 'Daily Earnings',
        amount: 850,
        date: '2026-04-27',
        description: 'Trike boundary + tips',
        icon: 'Coins',
      },
      {
        id: '3',
        type: 'expense',
        category: 'Load & Data',
        amount: 99,
        date: '2026-04-26',
        description: 'Mobile data reload',
        icon: 'Signal',
      },
    ],
    dailyCheckIn: {
      date: getTodayKey(),
      totalSaved: 0,
      completed: false,
      streakCount: 7,
    },
    savingsEntries: [
      {
        id: 'seed-1',
        amount: 200,
        date: '2026-04-27',
        sourceNote: 'GCash savings',
        allocations: [{ goalId: '1', amount: 200 }],
        createdBy: 'manual',
      },
      {
        id: 'seed-2',
        amount: 150,
        date: '2026-04-26',
        sourceNote: 'Cash envelope',
        allocations: [
          { goalId: '2', amount: 100 },
          { goalId: '3', amount: 50 },
        ],
        createdBy: 'manual',
      },
    ],
  }
}

function normalizeAllocations(amount: number, allocations: SavingsAllocation[]) {
  const cleaned = allocations
    .filter((allocation) => allocation.amount > 0)
    .map((allocation) => ({
      goalId: allocation.goalId,
      amount: Math.round(allocation.amount),
    }))

  const total = cleaned.reduce((sum, allocation) => sum + allocation.amount, 0)
  if (total === amount || cleaned.length === 0) {
    return cleaned
  }

  const adjusted = [...cleaned]
  adjusted[adjusted.length - 1] = {
    ...adjusted[adjusted.length - 1],
    amount: adjusted[adjusted.length - 1].amount + (amount - total),
  }
  return adjusted
}

function hydrateState(raw: Partial<AppState>): AppState {
  const initial = createInitialState()

  return {
    ...initial,
    ...raw,
    userProfile: {
      ...initial.userProfile,
      ...(raw.userProfile ?? {}),
    },
    leaks: raw.leaks ?? initial.leaks,
    goals: raw.goals ?? initial.goals,
    storms: raw.storms ?? initial.storms,
    boatHealth: raw.boatHealth ?? initial.boatHealth,
    transactions: raw.transactions ?? initial.transactions,
    dailyCheckIn: raw.dailyCheckIn ?? initial.dailyCheckIn,
    savingsEntries: raw.savingsEntries ?? initial.savingsEntries,
  }
}

function personalizeState(prev: AppState, answers: DemoOnboardingAnswers): AppState {
  const name = answers.name.trim() || prev.userProfile.name
  const role = answers.role.trim() || prev.userProfile.role
  const incomeCadence = answers.incomeCadence.trim() || prev.userProfile.incomeCadence
  const primaryGoal = answers.primaryGoal.trim()
  const pressurePoint = answers.pressurePoint.trim()
  const priorityGoalId = prev.goals.find((goal) => goal.isPriority)?.id ?? prev.goals[0]?.id

  return {
    ...prev,
    userProfile: {
      name,
      role,
      incomeCadence,
    },
    goals: prev.goals.map((goal) =>
      goal.id === priorityGoalId
        ? {
            ...goal,
            name: primaryGoal || goal.name,
            isPriority: true,
          }
        : { ...goal, isPriority: false },
    ),
    storms: pressurePoint
      ? prev.storms.map((storm, index) => (index === 0 ? { ...storm, name: pressurePoint } : storm))
      : prev.storms,
    boatHealth: {
      ...prev.boatHealth,
      aiInsight: `${name}, your ledger has a steady course. Keep ${primaryGoal || 'your main goal'} moving and clear ${pressurePoint || 'your nearest bill'} early to stay ahead of the weather.`,
      recommendations: [
        `Protect ${pressurePoint || prev.storms[0]?.name || 'your nearest bill'} before optional spending today.`,
        `Keep feeding ${primaryGoal || prev.goals.find((goal) => goal.isPriority)?.name || 'your main goal'} with even small daily deposits.`,
        `Use your ${incomeCadence.toLowerCase()} income rhythm to set one fixed savings habit this week.`,
      ],
    },
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === 'undefined') return createInitialState()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return hydrateState(JSON.parse(stored) as Partial<AppState>)
    } catch {
      // ignore parse errors
    }
    return createInitialState()
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  const patchLeak = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      leaks: prev.leaks.map((leak) => (leak.id === id ? { ...leak, patched: true } : leak)),
      boatHealth: {
        ...prev.boatHealth,
        overallScore: Math.min(100, prev.boatHealth.overallScore + 4),
      },
    }))
  }, [])

  const prioritizeGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) => ({ ...goal, isPriority: goal.id === id })),
    }))
  }, [])

  const logSavingsEntry = useCallback(
    (
      amount: number,
      allocations: SavingsAllocation[],
      sourceNote: string,
      createdBy: 'manual' | 'captain' = 'manual',
    ) => {
      const roundedAmount = Math.max(0, Math.round(amount))
      if (roundedAmount <= 0) return

      setState((prev) => {
        const today = getTodayKey()
        const normalized = normalizeAllocations(roundedAmount, allocations)
        const entry: SavingsEntry = {
          id: `${today}-${Date.now()}`,
          amount: roundedAmount,
          date: today,
          sourceNote: sourceNote.trim() || 'Manual savings log',
          allocations: normalized,
          createdBy,
        }

        const goalUpdates = new Map<string, number>()
        normalized.forEach((allocation) => {
          goalUpdates.set(allocation.goalId, (goalUpdates.get(allocation.goalId) ?? 0) + allocation.amount)
        })

        const nextCheckIn =
          prev.dailyCheckIn.date === today
            ? {
                ...prev.dailyCheckIn,
                totalSaved: prev.dailyCheckIn.totalSaved + roundedAmount,
                completed: true,
              }
            : {
                date: today,
                totalSaved: roundedAmount,
                completed: true,
                streakCount:
                  new Date(today).getTime() - new Date(prev.dailyCheckIn.date).getTime() <= 86400000
                    ? prev.dailyCheckIn.streakCount + 1
                    : 1,
              }

        return {
          ...prev,
          currentBalance: prev.currentBalance + roundedAmount,
          goals: prev.goals.map((goal) =>
            goalUpdates.has(goal.id)
              ? {
                  ...goal,
                  savedAmount: Math.min(goal.targetAmount, goal.savedAmount + (goalUpdates.get(goal.id) ?? 0)),
                }
              : goal,
          ),
          savingsEntries: [entry, ...prev.savingsEntries],
          dailyCheckIn: nextCheckIn,
        }
      })
    },
    [],
  )

  const contributeToGoal = useCallback(
    (id: string, amount: number) => {
      logSavingsEntry(amount, [{ goalId: id, amount }], 'Captain quick contribution', 'captain')
    },
    [logSavingsEntry],
  )

  const addGoal = useCallback((name: string, targetAmount: number) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      name: name.trim(),
      savedAmount: 0,
      targetAmount,
      weeklyContribution: 0,
      icon: 'Star',
      color: 'from-teal to-sky',
      isPriority: false,
    }
    setState((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }))
  }, [])

  const applyOnboarding = useCallback((answers: DemoOnboardingAnswers) => {
    setState((prev) => personalizeState(prev, answers))
  }, [])

  const resetDemo = useCallback(() => {
    setState(createInitialState())
  }, [])

  return {
    state,
    patchLeak,
    prioritizeGoal,
    contributeToGoal,
    logSavingsEntry,
    addGoal,
    applyOnboarding,
    resetDemo,
  }
}
