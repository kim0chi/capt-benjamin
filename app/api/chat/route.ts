import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import type { AppState } from '@/types'

function buildUserContext(state: AppState): string {
  const activeLeaks = state.leaks.filter((l) => !l.patched)
  const storms = [...state.storms].sort((a, b) => a.daysUntilDue - b.daysUntilDue)

  return `
## User's Live Financial State
Balance: ₱${state.currentBalance.toLocaleString()} | Income: ₱${state.monthlyIncome.toLocaleString()}/mo | Expenses: ₱${state.monthlyExpenses.toLocaleString()}/mo
Safe to spend today: ₱${state.safeToSpend} | Days until payday: ${state.daysUntilPayday}
Boat health: ${state.boatHealth.overallScore}/100 (${state.boatHealth.status})
Today's savings streak: ${state.dailyCheckIn.streakCount} days | Saved today: ₱${state.dailyCheckIn.totalSaved} | Check-in done: ${state.dailyCheckIn.completed ? 'Yes' : 'No'}

## Savings Goals
${state.goals
  .map((g) => {
    const pct = Math.round((g.savedAmount / g.targetAmount) * 100)
    return `- ${g.name}${g.isPriority ? ' ★ [PRIORITY]' : ''}: ₱${g.savedAmount.toLocaleString()} / ₱${g.targetAmount.toLocaleString()} (${pct}%)`
  })
  .join('\n')}

## Spending Leaks
${activeLeaks.length ? activeLeaks.map((l) => `- ${l.category}: ₱${l.amount}/${l.frequency}`).join('\n') : '- None active (all patched — great work!)'}

## Upcoming Bills (Storms)
${storms.map((s) => `- ${s.name}: ₱${s.amount.toLocaleString()} due in ${s.daysUntilDue} day(s) [${s.priority}]`).join('\n')}
`
}

export async function POST(req: Request) {
  try {
    const { messages, userState }: { messages: UIMessage[]; userState?: AppState } = await req.json()

    const contextSection = userState ? buildUserContext(userState) : ''

    const system = `You are Capt. Benjamin, a trusted and warm financial guide for Filipino daily earners and microfinance borrowers — sari-sari store owners, tricycle drivers, market vendors, and informal workers. The app is named Capt. Benjamin, built for RAFI microfinance clients.

Personality:
- Speak like a seasoned ship captain keeping a precise ledger — confident, caring, practical
- Use nautical language sparingly but memorably: log, chart, storm, hull, cargo, harbor, anchor
- Be encouraging but honest — never sugarcoat real financial risks
- Keep replies short and direct: 2–4 sentences max for action confirmations
- Always reference the user's actual numbers when giving advice (use the financial state below)
- When the user logs savings, confirm: exact amount, which goal it went to, and the updated progress
- When asked about leaks, name the specific leak from their data and give one concrete way to reduce it
- When asked about bills/storms, name the specific upcoming bill and how many days they have

${contextSection}

You are a financial guide, not a licensed advisor. For major decisions, encourage consulting a professional.`

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Failed to process chat message.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
