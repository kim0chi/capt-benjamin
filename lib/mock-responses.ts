import type { AIAction, SavingsAllocation } from '@/types'

const GOALS = [
  { id: '1', name: 'Emergency Reserve', aliases: ['emergency', 'reserve', 'emergency reserve'] },
  { id: '2', name: 'Tuition Chest', aliases: ['tuition', 'school', 'tuition chest'] },
  { id: '3', name: 'New Phone Bounty', aliases: ['phone', 'new phone', 'phone bounty'] },
  { id: '4', name: 'Debt Payoff', aliases: ['debt', 'loan', 'payoff', 'debt payoff'] },
] as const

const FALLBACK_RESPONSES = {
  budget: [
    'Keep today simple: log what you saved, protect your next bill, and avoid one repeat leak.',
    'The cleanest plan is the one you can repeat tomorrow. Save a small amount first, then spend from what remains.',
  ],
  spending: [
    'Your strongest leak to watch is still convenience spending. Patch one repeat habit and move that amount into a goal.',
    'When money feels tight, the best move is usually smaller daily waste, not one dramatic cut.',
  ],
  savings: [
    'Small cargo moved every day beats a perfect plan that never leaves harbor.',
    'If the amount is small, that is fine. The habit matters more than the size of one entry.',
  ],
  default: [
    'Tell me what you saved today, where you placed it, or which goal needs the next push.',
    'Give me the amount and destination, and I will chart the next step clearly.',
  ],
} as const

function randomItem(items: readonly string[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function findGoalByText(text: string) {
  const lower = text.toLowerCase()
  return GOALS.find((goal) => goal.aliases.some((alias) => lower.includes(alias)))
}

function findGoalName(goalId: string) {
  return GOALS.find((goal) => goal.id === goalId)?.name ?? 'Goal'
}

function parseAmountToken(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const amount = Number(cleaned)
  return Number.isFinite(amount) ? Math.round(amount) : 0
}

function parseSavingsAllocations(text: string) {
  const lower = text.toLowerCase()
  const allocations: SavingsAllocation[] = []
  const seen = new Set<string>()
  const patterns = [
    /(?:p|php|₱)?\s*(\d+(?:\.\d+)?)\s*(?:to|for|into)\s+([a-z ]+?)(?=,| and |$)/g,
    /([a-z ]+?)\s*(?:gets|get|take|takes)\s*(?:p|php|₱)?\s*(\d+(?:\.\d+)?)/g,
  ]

  for (const pattern of patterns) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(lower)) !== null) {
      const amount = parseAmountToken(match[1])
      const label = pattern === patterns[0] ? match[2] : match[1]
      const goal = findGoalByText(label)
      if (!goal || amount <= 0) continue
      const key = `${goal.id}-${amount}-${match.index}`
      if (seen.has(key)) continue
      seen.add(key)
      allocations.push({ goalId: goal.id, amount })
    }
  }

  return allocations
}

function parseSavingsAction(text: string): AIAction | undefined {
  const lower = text.toLowerCase()
  const looksLikeSavingsLog =
    /(saved|save|set aside|stash|logged|log|put away|put into)/.test(lower) &&
    /\d/.test(lower)

  if (!looksLikeSavingsLog) return undefined

  const amounts = [...lower.matchAll(/(?:p|php|₱)?\s*(\d+(?:\.\d+)?)/g)]
    .map((match) => parseAmountToken(match[1]))
    .filter((amount) => amount > 0)

  if (amounts.length === 0) return undefined

  const totalAmount = amounts[0]
  const parsedAllocations = parseSavingsAllocations(text)
  const allocations =
    parsedAllocations.length > 0
      ? parsedAllocations
      : [{ goalId: findGoalByText(text)?.id ?? '1', amount: totalAmount }]

  return {
    type: 'LOG_SAVINGS',
    amount: totalAmount,
    allocations,
    sourceNote: 'Captain chat check-in',
    createdBy: 'captain',
  }
}

function parseGoalPriorityAction(text: string): AIAction | undefined {
  const lower = text.toLowerCase()
  if (!/(prioritize|focus on|set course|make .*priority|all into)/.test(lower)) {
    return undefined
  }

  const goal = findGoalByText(text)
  return goal ? { type: 'PRIORITIZE_GOAL', id: goal.id } : undefined
}

function parseLeakAction(text: string): AIAction | undefined {
  const lower = text.toLowerCase()
  if (!/(patch|fix|cut|stop)/.test(lower)) return undefined
  if (/(food|delivery|takeout)/.test(lower)) return { type: 'PATCH_LEAK', id: '1' }
  if (/(coffee|cafe)/.test(lower)) return { type: 'PATCH_LEAK', id: '2' }
  if (/(stream|subscription|netflix)/.test(lower)) return { type: 'PATCH_LEAK', id: '3' }
  return undefined
}

export function parseAIAction(text: string): AIAction | undefined {
  return parseSavingsAction(text) ?? parseGoalPriorityAction(text) ?? parseLeakAction(text)
}

function buildSavingsReply(action: Extract<AIAction, { type: 'LOG_SAVINGS' }>) {
  const allocationText = action.allocations
    .map((allocation) => `P${allocation.amount} to ${findGoalName(allocation.goalId)}`)
    .join(', ')

  const dominantGoal = action.allocations[0]
  const dominantGoalName = dominantGoal ? findGoalName(dominantGoal.goalId) : 'your main goal'

  return `Logged. I marked P${action.amount} saved today and charted ${allocationText}. That moves ${dominantGoalName} closer without waiting for a perfect amount tomorrow.`
}

export function generateMockSuggestion(userMessage: string): { text: string; action?: AIAction } {
  const action = parseAIAction(userMessage)
  const lower = userMessage.toLowerCase()

  if (action?.type === 'LOG_SAVINGS') {
    return {
      text: buildSavingsReply(action),
      action,
    }
  }

  if (action?.type === 'PRIORITIZE_GOAL') {
    return {
      text: `Course updated. I moved your main attention to ${findGoalName(action.id)} so the next savings log points there first.`,
      action,
    }
  }

  if (action?.type === 'PATCH_LEAK') {
    const leakName =
      action.id === '1' ? 'food delivery' : action.id === '2' ? 'coffee runs' : 'unused subscriptions'
    return {
      text: `Marked. ${leakName} is the leak to patch next, which frees more room for tomorrow's savings check-in.`,
      action,
    }
  }

  if (/(safe spend|safely spend|how much can i spend)/.test(lower)) {
    return {
      text: 'Spend only after the savings log is done. Protect today’s set-aside first, then keep optional spending inside the safe amount shown on home.',
    }
  }

  if (/(storm|bill|due)/.test(lower)) {
    return {
      text: 'Watch the nearest storm first. Clear the next bill before sending extra cargo to lower-priority goals.',
    }
  }

  if (/(save|goal|check-in|streak)/.test(lower)) {
    return {
      text: randomItem(FALLBACK_RESPONSES.savings),
    }
  }

  if (/(spend|expense|leak)/.test(lower)) {
    return {
      text: randomItem(FALLBACK_RESPONSES.spending),
    }
  }

  if (/(budget|plan|weekly)/.test(lower)) {
    return {
      text: randomItem(FALLBACK_RESPONSES.budget),
    }
  }

  return {
    text: randomItem(FALLBACK_RESPONSES.default),
  }
}
