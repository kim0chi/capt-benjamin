import { z } from 'zod'
import type { DemoStateAction } from '@/lib/demo-state/types'

const savingsAllocationSchema = z.object({
  goalId: z.string(),
  amount: z.number(),
})

const stormPrioritySchema = z.enum(['critical', 'high', 'medium'])

export const demoStateActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('PATCH_LEAK'),
    id: z.string(),
  }),
  z.object({
    type: z.literal('PRIORITIZE_GOAL'),
    id: z.string(),
  }),
  z.object({
    type: z.literal('LOG_SAVINGS'),
    amount: z.number(),
    allocations: z.array(savingsAllocationSchema),
    sourceNote: z.string(),
    createdBy: z.enum(['manual', 'kapitan']).optional(),
    jarId: z.string().optional(),
  }),
  z.object({
    type: z.literal('ADD_GOAL'),
    name: z.string(),
    targetAmount: z.number(),
  }),
  z.object({
    type: z.literal('ADD_BILL'),
    bill: z.object({
      name: z.string(),
      dueDate: z.string(),
      amount: z.number(),
      daysUntilDue: z.number(),
      priority: stormPrioritySchema,
      icon: z.string(),
      remindAt: z.string().optional(),
      notes: z.string().optional(),
      handledAt: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('MARK_BILL_HANDLED'),
    id: z.string(),
  }),
  z.object({
    type: z.literal('DELETE_BILL'),
    id: z.string(),
  }),
  z.object({
    type: z.literal('SNOOZE_BILL'),
    id: z.string(),
    remindAt: z.string(),
  }),
  z.object({
    type: z.literal('ADD_JAR'),
    name: z.string(),
    icon: z.string(),
    color: z.string(),
  }),
  z.object({
    type: z.literal('DEPOSIT_TO_JAR'),
    jarId: z.string(),
    amount: z.number(),
  }),
  z.object({
    type: z.literal('WITHDRAW_FROM_JAR'),
    jarId: z.string(),
    amount: z.number(),
    sourceNote: z.string(),
  }),
  z.object({
    type: z.literal('PAY_BILL'),
    billId: z.string(),
    jarId: z.string(),
  }),
  z.object({
    type: z.literal('APPLY_ONBOARDING'),
    answers: z.object({
      name: z.string(),
      role: z.string(),
      incomeCadence: z.string(),
      primaryGoal: z.string(),
      pressurePoint: z.string(),
    }),
  }),
  z.object({
    type: z.literal('RESET_DEMO'),
  }),
])

export function parseDemoStateAction(input: unknown): DemoStateAction {
  return demoStateActionSchema.parse(input) as DemoStateAction
}
