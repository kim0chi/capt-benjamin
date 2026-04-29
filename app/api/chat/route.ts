import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import type { AppState } from '@/types'

function buildUserContext(state: AppState): string {
  const activeLeaks = state.leaks.filter((leak) => !leak.patched)
  const upcomingBills = [...state.storms]
    .filter((storm) => storm.status !== 'handled')
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)

  return `
## User's Live Financial State
Balance: P${state.currentBalance.toLocaleString()} | Income: P${state.monthlyIncome.toLocaleString()}/mo | Expenses: P${state.monthlyExpenses.toLocaleString()}/mo
Safe to spend today: P${state.safeToSpend} | Days until payday: ${state.daysUntilPayday}
Money condition: ${state.boatHealth.overallScore}/100 (${state.boatHealth.status})
Today's savings streak: ${state.dailyCheckIn.streakCount} days | Saved today: P${state.dailyCheckIn.totalSaved} | Check-in done: ${state.dailyCheckIn.completed ? 'Yes' : 'No'}

## Savings Goals
${state.goals
  .map((goal) => {
    const pct = Math.round((goal.savedAmount / goal.targetAmount) * 100)
    return `- ${goal.name}${goal.isPriority ? ' [PRIORITY]' : ''}: P${goal.savedAmount.toLocaleString()} / P${goal.targetAmount.toLocaleString()} (${pct}%)`
  })
  .join('\n')}

## Spending Habits To Watch
${activeLeaks.length ? activeLeaks.map((leak) => `- ${leak.category}: P${leak.amount}/${leak.frequency}`).join('\n') : '- No major spending habit is active right now.'}

## Upcoming Bills
${upcomingBills.length ? upcomingBills.map((storm) => `- ${storm.name}: P${storm.amount.toLocaleString()} due in ${storm.daysUntilDue} day(s) [${storm.priority}]`).join('\n') : '- No upcoming bills need attention right now.'}
`
}

export async function POST(req: Request) {
  try {
    const { messages, userState }: { messages: UIMessage[]; userState?: AppState } = await req.json()

    const contextSection = userState ? buildUserContext(userState) : ''

    const system = `You are Kapitan, a trusted and warm financial guide for Filipino daily earners and microfinance borrowers such as sari-sari store owners, tricycle drivers, market vendors, and informal workers.

Personality:
- Speak simply, clearly, and with practical care
- Keep a light captain personality, but do not overuse sea metaphors
- Be encouraging but honest about financial risks
- Keep replies short and direct: usually 2 to 4 sentences
- Always reference the user's actual numbers when giving advice
- When the user logs savings, confirm the exact amount, which goal it went to, and updated progress
- When asked about spending habits, name the specific habit from their data and give one clear way to reduce it
- When asked about bills, name the specific upcoming bill and how many days they have

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
