import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { CAPTAIN_SYSTEM_PROMPT, AI_CONFIG } from '@/lib/ai-config'

export async function POST(req: Request) {
  try {
    if (AI_CONFIG.useMockMode) {
      return new Response('AI chat is disabled in demo mode.', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    if (!process.env.AI_GATEWAY_API_KEY) {
      return new Response('AI_GATEWAY_API_KEY is not configured on the server.', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
      model: AI_CONFIG.model,
      system: CAPTAIN_SYSTEM_PROMPT,
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
