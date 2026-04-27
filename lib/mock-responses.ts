import type { AIAction } from '@/types'

const responses: Record<string, string[]> = {
  budget: [
    'Your provisions budget is holding steady. Keep an eye on weekend spending so it does not spring a leak.',
    'Entertainment costs are drifting upward. Trim a little there and your reserves will look healthier.',
    'Dining spending is under control. Staying below target gives you more room for bounty elsewhere.',
    'Transport costs look routine this week. No rough waters there.',
  ],
  spending: [
    'Coffee spending has become a frequent leak. A few home-brew mornings would patch it quickly.',
    'Online shopping is up compared with last month. Worth checking whether that drift was planned.',
    'Utilities eased off this month. Good sign that your recent adjustments are working.',
    'Meal prep spending is up, but dining out is down. That is usually a profitable trade.',
  ],
  savings: [
    'You are on pace to stash a solid share of income this month. Hold the course.',
    'Keep this savings rate and your emergency reserve should fill out within a few months.',
    'Treasure kept today buys freedom later. The steady captains win in the long run.',
    "Your current pace makes this quarter's goal feel very reachable.",
  ],
  goals: [
    'Based on your ledger, I would focus on subscriptions, meal planning, and automatic transfers first.',
    'Your overall financial condition is improving. The fundamentals look steadier than before.',
    'Trim a small portion of discretionary spending and your voyage to the goal shortens meaningfully.',
    'The habits are forming well. Keep tracking, keep adjusting, and the destination stays within reach.',
  ],
  default: [
    'A fair question. Give me a little more context and I will chart the clearest course.',
    'Focus first on what you can measure, what you can cut, and what you can automate.',
    'That is a useful observation. The next step is turning it into a repeatable money habit.',
    'Let us chart this properly. Tell me the exact concern and I will break it down plainly.',
  ],
}

export function getMockResponse(topic: string): string {
  const topicKey = (topic.toLowerCase() as keyof typeof responses) || 'default'
  const topicResponses = responses[topicKey] || responses.default
  return topicResponses[Math.floor(Math.random() * topicResponses.length)]
}

export function generateMockInsights() {
  return [
    {
      id: '1',
      title: 'Treasure Reserve on Course',
      description:
        'Savings are moving faster than target this month, which gives the voyage more flexibility.',
      actionItems: ['Keep the same pace this week', 'Consider increasing reserve targets next month'],
      type: 'success' as const,
    },
    {
      id: '2',
      title: 'Coffee Leak Needs Patching',
      description:
        'Coffee and beverage spending is climbing fast enough to become a recurring hull leak.',
      actionItems: ['Brew at home three days this week', 'Track every small drink purchase for seven days'],
      type: 'warning' as const,
    },
    {
      id: '3',
      title: 'Galley Strategy Is Working',
      description:
        'Meal prep costs are up, but dining out is down. The trade still favors your ledger.',
      actionItems: ['Keep the prep routine going', 'Redirect the difference into a goal fund'],
      type: 'info' as const,
    },
  ]
}

export function parseAIAction(text: string): AIAction | undefined {
  const lower = text.toLowerCase()
  if (lower.includes('patch') && (lower.includes('food') || lower.includes('delivery'))) {
    return { type: 'PATCH_LEAK', id: '1' }
  }
  if (lower.includes('patch') && lower.includes('coffee')) {
    return { type: 'PATCH_LEAK', id: '2' }
  }
  if (lower.includes('patch') && lower.includes('stream')) {
    return { type: 'PATCH_LEAK', id: '3' }
  }
  if ((lower.includes('prioritize') || lower.includes('focus on') || lower.includes('course')) &&
      (lower.includes('emergency') || lower.includes('reserve'))) {
    return { type: 'PRIORITIZE_GOAL', id: '1' }
  }
  if ((lower.includes('prioritize') || lower.includes('focus on')) && lower.includes('tuition')) {
    return { type: 'PRIORITIZE_GOAL', id: '2' }
  }
  if ((lower.includes('prioritize') || lower.includes('focus on')) && lower.includes('phone')) {
    return { type: 'PRIORITIZE_GOAL', id: '3' }
  }
  if ((lower.includes('prioritize') || lower.includes('focus on')) && lower.includes('debt')) {
    return { type: 'PRIORITIZE_GOAL', id: '4' }
  }
  return undefined
}

export function generateMockSuggestion(userMessage: string): { text: string; action?: AIAction } {
  const lower = userMessage.toLowerCase()

  if ((lower.includes('patch') || lower.includes('fix')) && (lower.includes('food') || lower.includes('delivery'))) {
    return {
      text: "Logged, Captain. The food delivery leak is marked for patching — that plugs ₱640 from draining the hull every week. Your ship condition just improved. 🔧",
      action: { type: 'PATCH_LEAK', id: '1' },
    }
  }
  if ((lower.includes('patch') || lower.includes('fix')) && lower.includes('coffee')) {
    return {
      text: "Done. The coffee leak is sealed. ☕ ₱380 per week stays aboard. A simple home brew kit pays for itself in fewer than three weeks.",
      action: { type: 'PATCH_LEAK', id: '2' },
    }
  }
  if ((lower.includes('patch') || lower.includes('fix')) && lower.includes('stream')) {
    return {
      text: "Streaming subscriptions trimmed. ₱220 per month back in the ledger. Check each service quarterly to keep this leak closed.",
      action: { type: 'PATCH_LEAK', id: '3' },
    }
  }
  if ((lower.includes('prioritize') || lower.includes('focus') || lower.includes('set course')) &&
      (lower.includes('emergency') || lower.includes('reserve'))) {
    return {
      text: "Course set for Emergency Reserve Island. 🧭 All weekly contributions now route there first. At ₱450 per week, landfall is about 8 weeks out.",
      action: { type: 'PRIORITIZE_GOAL', id: '1' },
    }
  }
  if ((lower.includes('prioritize') || lower.includes('focus')) && lower.includes('tuition')) {
    return {
      text: "Charting course for Tuition Island. 🎓 Long voyage ahead — consistency matters more than speed here. Avoid new subscriptions this month.",
      action: { type: 'PRIORITIZE_GOAL', id: '2' },
    }
  }
  if ((lower.includes('prioritize') || lower.includes('focus')) && lower.includes('phone')) {
    return {
      text: "New Phone Bounty set as priority destination. 📱 At ₱350 per week, you arrive in roughly 16 weeks. Patch one leak to shorten the voyage.",
      action: { type: 'PRIORITIZE_GOAL', id: '3' },
    }
  }
  if ((lower.includes('prioritize') || lower.includes('focus')) && lower.includes('debt')) {
    return {
      text: "Debt Payoff Island is now your primary target. 🏦 ₱600 per week gets you there in about 17 weeks. Fewer storms, more breathing room.",
      action: { type: 'PRIORITIZE_GOAL', id: '4' },
    }
  }

  if (lower.includes('budget') || lower.includes('limit')) {
    return { text: getMockResponse('budget') }
  }
  if (lower.includes('spend') || lower.includes('expense') || lower.includes('leak')) {
    return { text: getMockResponse('spending') }
  }
  if (lower.includes('save') || lower.includes('goal') || lower.includes('island') || lower.includes('treasure')) {
    return { text: getMockResponse('savings') }
  }
  if (lower.includes('advice') || lower.includes('help') || lower.includes('course')) {
    return { text: getMockResponse('goals') }
  }

  return { text: getMockResponse('default') }
}
