export type Transaction = {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  description: string
  icon: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export type UserProfile = {
  name: string
  role: string
  incomeCadence: string
}

export type DemoOnboardingAnswers = {
  name: string
  role: string
  incomeCadence: string
  primaryGoal: string
  pressurePoint: string
}

export type Leak = {
  id: string
  category: string
  amount: number
  frequency: string
  aiExplanation: string
  icon: string
  color: string
  patched?: boolean
}

export type Goal = {
  id: string
  name: string
  savedAmount: number
  targetAmount: number
  weeklyContribution: number
  icon: string
  color: string
  isPriority?: boolean
}

export type SavingsAllocation = {
  goalId: string
  amount: number
}

export type SavingsJar = {
  id: string
  name: string
  icon: string
  color: string
  balance: number
  notes?: string
}

export type SavingsEntry = {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  date: string
  sourceNote: string
  allocations: SavingsAllocation[]
  createdBy: 'manual' | 'kapitan'
  jarId?: string
}

export type DailyCheckIn = {
  date: string
  totalSaved: number
  completed: boolean
  streakCount: number
}

export type AIAction =
  | { type: 'PATCH_LEAK'; id: string }
  | { type: 'PRIORITIZE_GOAL'; id: string }
  | { type: 'CONTRIBUTE_GOAL'; id: string; amount: number }
  | {
      type: 'LOG_SAVINGS'
      amount: number
      allocations: SavingsAllocation[]
      sourceNote: string
      createdBy?: 'manual' | 'kapitan'
      jarId?: string
    }
  | {
      type: 'WITHDRAW_FROM_JAR'
      amount: number
      sourceNote: string
      createdBy?: 'manual' | 'kapitan'
      jarId?: string
    }
  | { type: 'COMPLETE_DAILY_CHECKIN' }

export type StormWarning = {
  id: string
  name: string
  dueDate: string
  amount: number
  daysUntilDue: number
  priority: 'critical' | 'high' | 'medium'
  icon: string
  status?: 'upcoming' | 'handled' | 'remind_later'
  remindAt?: string
  notes?: string
  handledAt?: string
  handledFromJarId?: string
}

export type BoatHealthCategory = {
  label: string
  score: number
  color: string
  description: string
}

export type BoatHealth = {
  overallScore: number
  status: 'Steady' | 'Needs Attention' | 'Urgent'
  categories: BoatHealthCategory[]
  aiInsight: string
  recommendations: string[]
}

export type AppState = {
  userProfile: UserProfile
  currentBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  safeToSpend: number
  daysUntilPayday: number
  leaks: Leak[]
  goals: Goal[]
  storms: StormWarning[]
  jars: SavingsJar[]
  boatHealth: BoatHealth
  transactions: Transaction[]
  dailyCheckIn: DailyCheckIn
  savingsEntries: SavingsEntry[]
}
