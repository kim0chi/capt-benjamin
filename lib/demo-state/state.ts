import type { AppState, DemoOnboardingAnswers, Goal, SavingsAllocation, SavingsEntry } from '@/types'
import type { DemoBillRecord, DemoProfileRecord, DemoSourceData, DemoStateAction } from '@/lib/demo-state/types'

const DAY_MS = 24 * 60 * 60 * 1000
const DEMO_TIME_ZONE = 'Asia/Manila'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DEMO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function getTodayKey() {
  return formatDate(new Date())
}

function addDays(base: string, delta: number) {
  const date = new Date(base)
  date.setDate(date.getDate() + delta)
  return formatDate(date)
}

function startOfDay(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function calculateDaysUntilDue(dueDate: string) {
  const due = startOfDay(dueDate)
  const today = startOfDay(getTodayKey())
  return Math.ceil((due.getTime() - today.getTime()) / DAY_MS)
}

function normalizeBillStatus(bill: DemoBillRecord): DemoBillRecord {
  return {
    ...bill,
    status: bill.status ?? 'upcoming',
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
  if (total === amount || cleaned.length === 0) return cleaned

  const adjusted = [...cleaned]
  adjusted[adjusted.length - 1] = {
    ...adjusted[adjusted.length - 1],
    amount: adjusted[adjusted.length - 1].amount + (amount - total),
  }
  return adjusted
}

function getConditionStatus(score: number): AppState['boatHealth']['status'] {
  if (score >= 85) return 'Steady'
  if (score >= 70) return 'Needs Attention'
  return 'Urgent'
}

function deriveDailyCheckIn(savingsEntries: SavingsEntry[]): AppState['dailyCheckIn'] {
  const today = getTodayKey()
  const totalSaved = savingsEntries
    .filter((entry) => entry.date === today)
    .reduce((sum, entry) => sum + entry.amount, 0)

  const uniqueDates = Array.from(new Set(savingsEntries.map((entry) => entry.date))).sort().reverse()
  let streakCount = 0
  let cursor = totalSaved > 0 ? today : addDays(today, -1)

  while (uniqueDates.includes(cursor)) {
    streakCount += 1
    cursor = addDays(cursor, -1)
  }

  return {
    date: today,
    totalSaved,
    completed: totalSaved > 0,
    streakCount,
  }
}

function deriveBoatHealth(
  profile: DemoProfileRecord,
  goals: Goal[],
  bills: DemoBillRecord[],
  leaks: AppState['leaks'],
): AppState['boatHealth'] {
  const activeLeaks = leaks.filter((leak) => !leak.patched)
  const dueSoon = bills.filter((bill) => bill.status !== 'handled' && calculateDaysUntilDue(bill.dueDate) <= 3)
  const remindLater = bills.filter((bill) => bill.status === 'remind_later')
  const handledCount = bills.filter((bill) => bill.status === 'handled').length
  const billsScore = Math.max(48, 92 - dueSoon.length * 11 - remindLater.length * 6 + handledCount * 4)
  const spendingScore = Math.max(50, 82 - activeLeaks.length * 6)
  const priorityGoal = goals.find((goal) => goal.isPriority) ?? goals[0]

  const categories: AppState['boatHealth']['categories'] = [
    {
      label: 'Cash Flow',
      score: 84,
      color: '#4ca08f',
      description: 'Income still covers daily needs with a small buffer for savings.',
    },
    {
      label: 'Bill Readiness',
      score: billsScore,
      color: '#c6a15b',
      description:
        dueSoon.length > 0
          ? `${dueSoon[0].name} is coming up soon, so bill planning needs your attention.`
          : remindLater.length > 0
            ? 'A few bills are set to remind later, so keep them visible this week.'
            : 'Your upcoming bills are under control right now.',
    },
    {
      label: 'Spending Habits',
      score: spendingScore,
      color: '#a4493d',
      description:
        activeLeaks.length > 0
          ? `${activeLeaks[0].category} is still the biggest habit pulling money away from your goals.`
          : 'You have already reduced the main habit drains in this demo plan.',
    },
    {
      label: 'Savings Progress',
      score: 88,
      color: '#d7bb7d',
      description: `Your main goal is still ${priorityGoal?.name ?? 'moving forward'}.`,
    },
    {
      label: 'Risk Watch',
      score: 82,
      color: '#6ea2a5',
      description: 'No unusual activity is showing up right now.',
    },
  ]

  const overallScore = Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length)
  const nextBill = bills
    .filter((bill) => bill.status !== 'handled')
    .sort((a, b) => calculateDaysUntilDue(a.dueDate) - calculateDaysUntilDue(b.dueDate))[0]

  return {
    overallScore,
    status: getConditionStatus(overallScore),
    categories,
    aiInsight: nextBill
      ? `${profile.name}, your money condition improves fastest when upcoming bills are handled early. ${nextBill.name} is the next one to settle.`
      : `${profile.name}, your bills are under control. Keep your savings habit going and stay consistent with the basics.`,
    recommendations: [
      nextBill
        ? `Handle ${nextBill.name} before optional spending so the rest of your plan stays on track.`
        : 'Keep your next savings check-in going now that your upcoming bills are under control.',
      activeLeaks.length > 0
        ? `Cut back on ${activeLeaks[0].category} this week and move that amount into savings.`
        : 'Keep the spending habits you already cleaned up.',
      remindLater.length > 0
        ? `Review ${remindLater.length} bill reminder${remindLater.length === 1 ? '' : 's'} before the due dates get too close.`
        : 'Check your forecast again after your next income day.',
    ],
  }
}

export function buildAppStateFromSource(source: DemoSourceData): AppState {
  const bills = source.bills.map(normalizeBillStatus)
  return {
    userProfile: {
      name: source.profile.name,
      role: source.profile.role,
      incomeCadence: source.profile.incomeCadence,
    },
    currentBalance: source.profile.currentBalance,
    monthlyIncome: source.profile.monthlyIncome,
    monthlyExpenses: source.profile.monthlyExpenses,
    safeToSpend: source.profile.safeToSpend,
    daysUntilPayday: source.profile.daysUntilPayday,
    leaks: source.leaks,
    goals: source.goals,
    storms: bills.map((bill) => ({
      ...bill,
      daysUntilDue: calculateDaysUntilDue(bill.dueDate),
    })),
    jars: source.jars,
    boatHealth: deriveBoatHealth(source.profile, source.goals, bills, source.leaks),
    transactions: source.transactions,
    dailyCheckIn: deriveDailyCheckIn(source.savingsEntries),
    savingsEntries: source.savingsEntries,
  }
}

export function createSeedSourceData(): DemoSourceData {
  const today = getTodayKey()

  return {
    profile: {
      name: 'Marisol',
      role: 'Daily earner',
      incomeCadence: 'Every day',
      currentBalance: 8450,
      monthlyIncome: 22000,
      monthlyExpenses: 16800,
      safeToSpend: 380,
      daysUntilPayday: 5,
    },
    leaks: [
      {
        id: '1',
        category: 'Sari-sari Snacks',
        amount: 560,
        frequency: 'Daily',
        aiExplanation:
          'Small corner-store spending adds up fast. Packing merienda three times a week could save around P240 a month.',
        icon: 'Utensils',
        color: 'border-coral',
      },
      {
        id: '2',
        category: 'Load & Data',
        amount: 320,
        frequency: 'Weekly',
        aiExplanation:
          'Data reloads are happening more often than the registered plan allows. A monthly promo could save roughly P80 per week.',
        icon: 'Signal',
        color: 'border-brass',
      },
      {
        id: '3',
        category: 'Pasalubong',
        amount: 180,
        frequency: 'Weekly',
        aiExplanation:
          'Pasalubong spending is generous but uneven. Setting a fixed amount keeps this from eating into your savings plan.',
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
    bills: [
      {
        id: '1',
        name: 'Electric Bill',
        dueDate: today,
        amount: 1650,
        priority: 'critical',
        icon: 'Bolt',
        status: 'upcoming',
      },
      {
        id: '2',
        name: 'RAFI Loan Payment',
        dueDate: addDays(today, 2),
        amount: 2200,
        priority: 'high',
        icon: 'Landmark',
        status: 'upcoming',
      },
      {
        id: '3',
        name: 'Internet / WiFi',
        dueDate: addDays(today, 4),
        amount: 999,
        priority: 'medium',
        icon: 'Signal',
        status: 'upcoming',
      },
    ],
    jars: [
      { id: 'jar-1', name: 'Emergency Fund', icon: 'Anchor', color: 'from-brass to-sand', balance: 5800 },
      { id: 'jar-2', name: "Anak's Tuition", icon: 'Scroll', color: 'from-sky to-teal', balance: 9500 },
      { id: 'jar-3', name: 'Daily Operations', icon: 'Coins', color: 'from-teal to-sky', balance: 1200 },
    ],
    savingsEntries: [
      {
        id: 'seed-1',
        type: 'deposit',
        amount: 200,
        date: addDays(today, -1),
        sourceNote: 'GCash savings',
        allocations: [{ goalId: '1', amount: 200 }],
        createdBy: 'manual',
      },
      {
        id: 'seed-2',
        type: 'deposit',
        amount: 150,
        date: addDays(today, -2),
        sourceNote: 'Cash envelope',
        allocations: [
          { goalId: '2', amount: 100 },
          { goalId: '3', amount: 50 },
        ],
        createdBy: 'manual',
      },
      {
        id: 'seed-3',
        type: 'deposit',
        amount: 120,
        date: addDays(today, -3),
        sourceNote: 'Pocket savings',
        allocations: [{ goalId: '1', amount: 120 }],
        createdBy: 'manual',
      },
      {
        id: 'seed-4',
        type: 'deposit',
        amount: 90,
        date: addDays(today, -4),
        sourceNote: 'Cash envelope',
        allocations: [{ goalId: '4', amount: 90 }],
        createdBy: 'manual',
      },
      {
        id: 'seed-5',
        type: 'deposit',
        amount: 150,
        date: addDays(today, -5),
        sourceNote: 'GCash savings',
        allocations: [{ goalId: '2', amount: 150 }],
        createdBy: 'manual',
      },
      {
        id: 'seed-6',
        type: 'deposit',
        amount: 80,
        date: addDays(today, -6),
        sourceNote: 'Drawer jar',
        allocations: [{ goalId: '3', amount: 80 }],
        createdBy: 'manual',
      },
      {
        id: 'seed-7',
        type: 'deposit',
        amount: 60,
        date: addDays(today, -7),
        sourceNote: 'Loose change',
        allocations: [{ goalId: '1', amount: 60 }],
        createdBy: 'manual',
      },
    ],
    transactions: [
      {
        id: '1',
        type: 'expense',
        category: 'Sari-sari Snacks',
        amount: 85,
        date: addDays(today, -2),
        description: 'Afternoon merienda',
        icon: 'Utensils',
      },
      {
        id: '2',
        type: 'income',
        category: 'Daily Earnings',
        amount: 850,
        date: addDays(today, -2),
        description: 'Trike boundary + tips',
        icon: 'Coins',
      },
      {
        id: '3',
        type: 'expense',
        category: 'Load & Data',
        amount: 99,
        date: addDays(today, -3),
        description: 'Mobile data reload',
        icon: 'Signal',
      },
    ],
  }
}

export function createSeedAppState() {
  return buildAppStateFromSource(createSeedSourceData())
}

export function hydrateSnapshot(raw: Partial<AppState>): AppState {
  const seed = createSeedAppState()
  return {
    ...seed,
    ...raw,
    userProfile: {
      ...seed.userProfile,
      ...(raw.userProfile ?? {}),
    },
    leaks: raw.leaks ?? seed.leaks,
    goals: raw.goals ?? seed.goals,
    storms: (raw.storms ?? seed.storms).map((storm) => ({
      ...storm,
      status: storm.status ?? 'upcoming',
    })),
    jars: raw.jars ?? seed.jars,
    boatHealth: raw.boatHealth ?? seed.boatHealth,
    transactions: raw.transactions ?? seed.transactions,
    dailyCheckIn: raw.dailyCheckIn ?? seed.dailyCheckIn,
    savingsEntries: raw.savingsEntries ?? seed.savingsEntries,
  }
}

function personalizeSnapshot(prev: AppState, answers: DemoOnboardingAnswers): AppState {
  const name = answers.name.trim() || prev.userProfile.name
  const role = answers.role.trim() || prev.userProfile.role
  const incomeCadence = answers.incomeCadence.trim() || prev.userProfile.incomeCadence
  const primaryGoal = answers.primaryGoal.trim()
  const pressurePoint = answers.pressurePoint.trim()
  const priorityGoalId = prev.goals.find((goal) => goal.isPriority)?.id ?? prev.goals[0]?.id

  const nextState: AppState = {
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
  }

  return refreshDerivedState(nextState)
}

export function refreshDerivedState(state: AppState): AppState {
  const source: DemoSourceData = {
    profile: {
      name: state.userProfile.name,
      role: state.userProfile.role,
      incomeCadence: state.userProfile.incomeCadence,
      currentBalance: state.currentBalance,
      monthlyIncome: state.monthlyIncome,
      monthlyExpenses: state.monthlyExpenses,
      safeToSpend: state.safeToSpend,
      daysUntilPayday: state.daysUntilPayday,
    },
    goals: state.goals,
    bills: state.storms.map((storm) => ({
      id: storm.id,
      name: storm.name,
      dueDate: storm.dueDate,
      amount: storm.amount,
      priority: storm.priority,
      icon: storm.icon,
      status: storm.status ?? 'upcoming',
      remindAt: storm.remindAt,
      notes: storm.notes,
      handledAt: storm.handledAt,
    })),
    jars: state.jars,
    leaks: state.leaks,
    savingsEntries: state.savingsEntries,
    transactions: state.transactions,
  }

  return buildAppStateFromSource(source)
}

export function applyDemoAction(prev: AppState, action: DemoStateAction): AppState {
  switch (action.type) {
    case 'PATCH_LEAK':
      return refreshDerivedState({
        ...prev,
        leaks: prev.leaks.map((leak) => (leak.id === action.id ? { ...leak, patched: true } : leak)),
      })
    case 'PRIORITIZE_GOAL':
      return refreshDerivedState({
        ...prev,
        goals: prev.goals.map((goal) => ({ ...goal, isPriority: goal.id === action.id })),
      })
    case 'LOG_SAVINGS': {
      const roundedAmount = Math.max(0, Math.round(action.amount))
      if (roundedAmount <= 0) return prev

      const today = getTodayKey()
      const normalized = normalizeAllocations(roundedAmount, action.allocations)
      const entry: SavingsEntry = {
        id: `${today}-${Date.now()}`,
        type: 'deposit',
        amount: roundedAmount,
        date: today,
        sourceNote: action.sourceNote.trim() || 'Manual savings log',
        allocations: normalized,
        createdBy: action.createdBy ?? 'manual',
        ...(action.jarId ? { jarId: action.jarId } : {}),
      }

      const goalUpdates = new Map<string, number>()
      normalized.forEach((allocation) => {
        goalUpdates.set(allocation.goalId, (goalUpdates.get(allocation.goalId) ?? 0) + allocation.amount)
      })

      return refreshDerivedState({
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
        jars: action.jarId
          ? prev.jars.map((jar) => (jar.id === action.jarId ? { ...jar, balance: jar.balance + roundedAmount } : jar))
          : prev.jars,
        savingsEntries: [entry, ...prev.savingsEntries],
      })
    }
    case 'ADD_GOAL':
      return refreshDerivedState({
        ...prev,
        goals: [
          ...prev.goals,
          {
            id: `goal-${Date.now()}`,
            name: action.name.trim(),
            savedAmount: 0,
            targetAmount: action.targetAmount,
            weeklyContribution: 0,
            icon: 'Star',
            color: 'from-teal to-sky',
            isPriority: false,
          },
        ],
      })
    case 'ADD_BILL':
      return refreshDerivedState({
        ...prev,
        storms: [
          ...prev.storms,
          {
            ...action.bill,
            id: `bill-${Date.now()}`,
            status: 'upcoming',
          },
        ],
      })
    case 'MARK_BILL_HANDLED':
      return refreshDerivedState({
        ...prev,
        storms: prev.storms.map((storm) =>
          storm.id === action.id
            ? { ...storm, status: 'handled', handledAt: getTodayKey(), remindAt: undefined }
            : storm,
        ),
      })
    case 'DELETE_BILL':
      return refreshDerivedState({
        ...prev,
        storms: prev.storms.filter((storm) => storm.id !== action.id),
      })
    case 'SNOOZE_BILL':
      return refreshDerivedState({
        ...prev,
        storms: prev.storms.map((storm) =>
          storm.id === action.id
            ? { ...storm, status: 'remind_later', remindAt: action.remindAt, handledAt: undefined }
            : storm,
        ),
      })
    case 'ADD_JAR':
      return refreshDerivedState({
        ...prev,
        jars: [
          ...prev.jars,
          {
            id: `jar-${Date.now()}`,
            name: action.name.trim(),
            icon: action.icon,
            color: action.color,
            balance: 0,
          },
        ],
      })
    case 'DEPOSIT_TO_JAR': {
      const roundedAmount = Math.max(0, Math.round(action.amount))
      if (roundedAmount <= 0) return prev

      const today = getTodayKey()
      return refreshDerivedState({
        ...prev,
        jars: prev.jars.map((jar) =>
          jar.id === action.jarId ? { ...jar, balance: jar.balance + roundedAmount } : jar,
        ),
        savingsEntries: [
          {
            id: `${today}-jar-${Date.now()}`,
            type: 'deposit',
            amount: roundedAmount,
            date: today,
            sourceNote: 'Jar deposit',
            allocations: [],
            createdBy: 'manual',
            jarId: action.jarId,
          },
          ...prev.savingsEntries,
        ],
      })
    }
    case 'WITHDRAW_FROM_JAR': {
      const roundedAmount = Math.max(0, Math.round(action.amount))
      if (roundedAmount <= 0) return prev

      const today = getTodayKey()
      return refreshDerivedState({
        ...prev,
        jars: prev.jars.map((jar) =>
          jar.id === action.jarId ? { ...jar, balance: Math.max(0, jar.balance - roundedAmount) } : jar,
        ),
        savingsEntries: [
          {
            id: `${today}-withdraw-${Date.now()}`,
            type: 'withdrawal',
            amount: roundedAmount,
            date: today,
            sourceNote: action.sourceNote.trim() || 'Withdrawal',
            allocations: [],
            createdBy: 'manual',
            jarId: action.jarId,
          },
          ...prev.savingsEntries,
        ],
      })
    }
    case 'PAY_BILL': {
      const bill = prev.storms.find((s) => s.id === action.billId)
      if (!bill) return prev

      const today = getTodayKey()
      const payAmount = bill.amount

      return refreshDerivedState({
        ...prev,
        storms: prev.storms.map((s) =>
          s.id === action.billId
            ? { ...s, status: 'handled', handledAt: today, handledFromJarId: action.jarId, remindAt: undefined }
            : s,
        ),
        jars: prev.jars.map((jar) =>
          jar.id === action.jarId ? { ...jar, balance: Math.max(0, jar.balance - payAmount) } : jar,
        ),
        savingsEntries: [
          {
            id: `${today}-bill-${Date.now()}`,
            type: 'withdrawal',
            amount: payAmount,
            date: today,
            sourceNote: `Bill payment: ${bill.name}`,
            allocations: [],
            createdBy: 'manual',
            jarId: action.jarId,
          },
          ...prev.savingsEntries,
        ],
      })
    }
    case 'APPLY_ONBOARDING':
      return personalizeSnapshot(prev, action.answers)
    case 'RESET_DEMO':
      return createSeedAppState()
    default:
      return prev
  }
}
