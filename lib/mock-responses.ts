import type { AIAction, SavingsAllocation } from '@/types'

const GOALS = [
  { id: '1', name: 'Emergency Reserve', aliases: ['emergency', 'reserve', 'emergency reserve'] },
  { id: '2', name: "Anak's Tuition", aliases: ['tuition', 'school', 'anak', 'anak tuition'] },
  { id: '3', name: 'RAFI Loan Payoff', aliases: ['rafi', 'loan', 'debt', 'payoff'] },
  { id: '4', name: 'Palengke Capital', aliases: ['palengke', 'capital', 'business capital'] },
] as const

const FALLBACK_RESPONSES = {
  budget: [
    'Keep today simple: log what you saved, protect the next bill, and avoid one repeat spending habit.',
    'The best plan is the one you can repeat tomorrow. Save a small amount first, then spend from what remains.',
  ],
  spending: [
    'The biggest habit to watch is still convenience spending. Cut one repeat expense and move that amount into savings.',
    'When money feels tight, the best move is usually reducing small daily waste, not making one dramatic cut.',
  ],
  savings: [
    'A small amount saved regularly is better than waiting for one perfect deposit.',
    'If the amount is small, that is fine. The habit matters more than one entry.',
  ],
  default: [
    'Tell me what you saved today, where you put it, or which goal needs the next push.',
    'Give me the amount and destination, and I will suggest the next step clearly.',
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
    /(?:p|php|₱)?\s*(\d+(?:\.\d+)?)\s*(?:to|for|into)\s+([a-z' ]+?)(?=,| and |$)/g,
    /([a-z' ]+?)\s*(?:gets|get|take|takes)\s*(?:p|php|₱)?\s*(\d+(?:\.\d+)?)/g,
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
    sourceNote: 'Kapitan chat check-in',
    createdBy: 'kapitan',
  }
}

function parseWithdrawalAction(text: string): AIAction | undefined {
  const lower = text.toLowerCase()
  const looksLikeSpendLog =
    /(spent|spend|used|paid|took out|withdraw|withdrew|gastos)/.test(lower) &&
    /\d/.test(lower)

  if (!looksLikeSpendLog) return undefined

  const amounts = [...lower.matchAll(/(?:p|php|â‚±)?\s*(\d+(?:\.\d+)?)/g)]
    .map((match) => parseAmountToken(match[1]))
    .filter((amount) => amount > 0)

  if (amounts.length === 0) return undefined

  return {
    type: 'WITHDRAW_FROM_JAR',
    amount: amounts[0],
    sourceNote: 'Kapitan chat spending log',
    createdBy: 'kapitan',
  }
}

function parseGoalPriorityAction(text: string): AIAction | undefined {
  const lower = text.toLowerCase()
  if (!/(prioritize|focus on|main goal|make .*priority|all into)/.test(lower)) {
    return undefined
  }

  const goal = findGoalByText(text)
  return goal ? { type: 'PRIORITIZE_GOAL', id: goal.id } : undefined
}

function parseLeakAction(text: string): AIAction | undefined {
  const lower = text.toLowerCase()
  if (!/(cut|stop|reduce|patch|avoid)/.test(lower)) return undefined
  if (/(snack|merienda|sari-sari)/.test(lower)) return { type: 'PATCH_LEAK', id: '1' }
  if (/(load|data|promo)/.test(lower)) return { type: 'PATCH_LEAK', id: '2' }
  if (/(pasalubong|treat|gift)/.test(lower)) return { type: 'PATCH_LEAK', id: '3' }
  return undefined
}

export function parseAIAction(text: string): AIAction | undefined {
  return parseSavingsAction(text) ?? parseWithdrawalAction(text) ?? parseGoalPriorityAction(text) ?? parseLeakAction(text)
}

function buildSavingsReply(action: Extract<AIAction, { type: 'LOG_SAVINGS' }>) {
  const allocationText = action.allocations
    .map((allocation) => `P${allocation.amount} to ${findGoalName(allocation.goalId)}`)
    .join(', ')

  const dominantGoal = action.allocations[0]
  const dominantGoalName = dominantGoal ? findGoalName(dominantGoal.goalId) : 'your main goal'

  return `Saved. I recorded P${action.amount} today and assigned ${allocationText}. That gives ${dominantGoalName} a clear push today.`
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

  if (action?.type === 'WITHDRAW_FROM_JAR') {
    return {
      text: `Noted. I recorded P${action.amount} as spending from your current jar so your balance and history stay accurate.`,
      action,
    }
  }

  if (action?.type === 'PRIORITIZE_GOAL') {
    return {
      text: `Done. I set ${findGoalName(action.id)} as the main goal so your next savings check-in goes there first.`,
      action,
    }
  }

  if (action?.type === 'PATCH_LEAK') {
    const leakName =
      action.id === '1' ? 'sari-sari snacks' : action.id === '2' ? 'load and data' : 'pasalubong spending'
    return {
      text: `Noted. ${leakName} is the spending habit to reduce next so you can free up more money for savings.`,
      action,
    }
  }

  if (/(safe spend|safely spend|how much can i spend)/.test(lower)) {
    return {
      text: 'Save first and protect the next bill before optional spending. Whatever remains is the safer amount to use today.',
    }
  }

  if (/(storm|bill|due)/.test(lower)) {
    return {
      text: 'Start with the nearest bill. Handling the next due amount early makes the rest of the week easier.',
    }
  }

  if (/(save|goal|check-in|streak)/.test(lower)) {
    return {
      text: randomItem(FALLBACK_RESPONSES.savings),
    }
  }

  if (/(spend|expense|leak|habit)/.test(lower)) {
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
