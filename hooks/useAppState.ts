'use client'

import { useState, useCallback } from 'react'
import type { AppState } from '@/types'

const initialState: AppState = {
  currentBalance: 9850,
  monthlyIncome: 28000,
  monthlyExpenses: 18500,
  safeToSpend: 420,
  daysUntilPayday: 6,
  leaks: [
    {
      id: '1',
      category: 'Food Delivery',
      amount: 640,
      frequency: 'Daily',
      aiExplanation:
        'Delivery showed up 18 times this month. Choosing pickup twice a week would patch one of the fastest leaks in the hull.',
      icon: 'Utensils',
      color: 'border-coral',
    },
    {
      id: '2',
      category: 'Coffee Shops',
      amount: 380,
      frequency: '4x per week',
      aiExplanation:
        'Premium coffee runs are small on their own, but together they keep draining cargo space from your weekly plan.',
      icon: 'Coffee',
      color: 'border-brass',
    },
    {
      id: '3',
      category: 'Streaming Services',
      amount: 220,
      frequency: 'Monthly',
      aiExplanation:
        'You are carrying more subscriptions than the crew is using. Trimming the extras frees steady room in the ledger.',
      icon: 'Monitor',
      color: 'border-sky',
    },
  ],
  goals: [
    {
      id: '1',
      name: 'Emergency Reserve',
      savedAmount: 6400,
      targetAmount: 10000,
      weeklyContribution: 450,
      icon: 'Anchor',
      color: 'from-brass to-sand',
      isPriority: true,
    },
    {
      id: '2',
      name: 'Tuition Chest',
      savedAmount: 12000,
      targetAmount: 50000,
      weeklyContribution: 800,
      icon: 'Scroll',
      color: 'from-sky to-teal',
    },
    {
      id: '3',
      name: 'New Phone Bounty',
      savedAmount: 3200,
      targetAmount: 8999,
      weeklyContribution: 350,
      icon: 'Gem',
      color: 'from-brass to-coral',
    },
    {
      id: '4',
      name: 'Debt Payoff',
      savedAmount: 5000,
      targetAmount: 15000,
      weeklyContribution: 600,
      icon: 'Shield',
      color: 'from-coral to-oxblood',
    },
  ],
  storms: [
    {
      id: '1',
      name: 'Internet Bill',
      dueDate: '2026-04-28',
      amount: 1499,
      daysUntilDue: 1,
      priority: 'critical',
      icon: 'Signal',
    },
    {
      id: '2',
      name: 'Electricity',
      dueDate: '2026-04-30',
      amount: 1800,
      daysUntilDue: 3,
      priority: 'high',
      icon: 'Bolt',
    },
    {
      id: '3',
      name: 'Loan Payment',
      dueDate: '2026-05-02',
      amount: 2500,
      daysUntilDue: 5,
      priority: 'medium',
      icon: 'Landmark',
    },
  ],
  boatHealth: {
    overallScore: 82,
    status: 'Floating',
    categories: [
      {
        label: 'Cash Flow',
        score: 88,
        color: '#4ca08f',
        description: 'Income still covers the voyage comfortably each month.',
      },
      {
        label: 'Bills Preparedness',
        score: 75,
        color: '#c6a15b',
        description: 'Two storms are close enough to deserve fresh attention.',
      },
      {
        label: 'Recurring Leaks',
        score: 70,
        color: '#a4493d',
        description: 'Habit spending is the main damage point in the hull this week.',
      },
      {
        label: 'Savings Voyage',
        score: 92,
        color: '#d7bb7d',
        description: 'Goal progress remains ahead of course.',
      },
      {
        label: 'Risk Watch',
        score: 85,
        color: '#6ea2a5',
        description: 'No suspicious activity is threatening the ledger right now.',
      },
    ],
    aiInsight:
      'The ship is holding steady. Patch the food delivery leak and pay tomorrow\'s internet bill on time, and your overall condition should improve quickly.',
    recommendations: [
      'Cook aboard four nights this week to recover around P160.',
      'Set aside tomorrow\'s internet payment before any optional spending.',
      'Increase the emergency reserve by P100 per week while conditions are calm.',
    ],
  },
  transactions: [
    {
      id: '1',
      type: 'expense',
      category: 'Food Delivery',
      amount: 245,
      date: '2026-04-26',
      description: 'Dinner order',
      icon: 'Utensils',
    },
    {
      id: '2',
      type: 'income',
      category: 'Salary',
      amount: 28000,
      date: '2026-04-15',
      description: 'Monthly pay',
      icon: 'Coins',
    },
    {
      id: '3',
      type: 'expense',
      category: 'Coffee',
      amount: 185,
      date: '2026-04-25',
      description: 'Cafe stop',
      icon: 'Coffee',
    },
  ],
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState)

  const patchLeak = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      leaks: prev.leaks.map(l => l.id === id ? { ...l, patched: true } : l),
      boatHealth: {
        ...prev.boatHealth,
        overallScore: Math.min(100, prev.boatHealth.overallScore + 4),
      },
    }))
  }, [])

  const prioritizeGoal = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => ({ ...g, isPriority: g.id === id })),
    }))
  }, [])

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g =>
        g.id === id ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) } : g
      ),
    }))
  }, [])

  return { state, patchLeak, prioritizeGoal, contributeToGoal }
}
