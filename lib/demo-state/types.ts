import type {
  AppState,
  Goal,
  Leak,
  SavingsEntry,
  SavingsJar,
  StormWarning,
  Transaction,
  UserProfile,
  DemoOnboardingAnswers,
  SavingsAllocation,
} from '@/types'

export type DemoProfileRecord = UserProfile & {
  currentBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  safeToSpend: number
  daysUntilPayday: number
}

export type DemoBillRecord = Omit<StormWarning, 'daysUntilDue'> & {
  status: NonNullable<StormWarning['status']>
}

export type DemoSourceData = {
  profile: DemoProfileRecord
  goals: Goal[]
  bills: DemoBillRecord[]
  jars: SavingsJar[]
  leaks: Leak[]
  savingsEntries: SavingsEntry[]
  transactions: Transaction[]
}

export type DemoStateAction =
  | { type: 'PATCH_LEAK'; id: string }
  | { type: 'PRIORITIZE_GOAL'; id: string }
  | {
      type: 'LOG_SAVINGS'
      amount: number
      allocations: SavingsAllocation[]
      sourceNote: string
      createdBy?: 'manual' | 'kapitan'
      jarId?: string
    }
  | { type: 'ADD_GOAL'; name: string; targetAmount: number }
  | { type: 'ADD_BILL'; bill: Omit<StormWarning, 'id' | 'status'> }
  | { type: 'MARK_BILL_HANDLED'; id: string }
  | { type: 'DELETE_BILL'; id: string }
  | { type: 'SNOOZE_BILL'; id: string; remindAt: string }
  | { type: 'ADD_JAR'; name: string; icon: string; color: string }
  | { type: 'DEPOSIT_TO_JAR'; jarId: string; amount: number }
  | { type: 'WITHDRAW_FROM_JAR'; jarId: string; amount: number; sourceNote: string }
  | { type: 'PAY_BILL'; billId: string; jarId: string }
  | { type: 'APPLY_ONBOARDING'; answers: DemoOnboardingAnswers }
  | { type: 'RESET_DEMO' }

export type DemoStateResponse = {
  snapshot: AppState
}
