'use client'

import { useEffect, useRef, useState } from 'react'
import { Compass, Loader2, Send } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { AI_CONFIG } from '@/lib/ai-config'
import { generateMockSuggestion, parseAIAction } from '@/lib/mock-responses'
import { CaptainBenjaminPortrait } from '@/components/illustrations/CaptainBenjaminPortrait'
import type { AIAction, AppState, ChatMessage } from '@/types'

const QUICK_PROMPTS = [
  'I saved P50 today',
  'What storm should I watch first?',
  'Where should my next savings go?',
  'What leak should I patch this week?',
  'How much can I safely spend today?',
] as const

interface CaptainChatScreenProps {
  onStateUpdate?: (action: AIAction) => void
  appState?: AppState
}

function getTextContent(message: { content?: string; parts?: Array<{ type: string; text?: string }> }) {
  if (typeof message.content === 'string') return message.content
  return (
    message.parts
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text ?? '')
      .join('') ?? ''
  )
}

export function CaptainChatScreen({ onStateUpdate, appState }: CaptainChatScreenProps) {
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Start with today. Tell me what you saved, what storm is closest, or which goal deserves first claim on your next spare peso.',
      timestamp: 0,
    },
  ])
  const [input, setInput] = useState('')
  const [isMockLoading, setIsMockLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pendingActionRef = useRef<AIAction | undefined>(undefined)
  const mockCounterRef = useRef(1)
  const { messages: aiMessages, sendMessage, status, error } = useChat()

  const isAiLoading = status === 'submitted' || status === 'streaming'
  const isBusy = AI_CONFIG.useMockMode ? isMockLoading : isAiLoading
  const messages = AI_CONFIG.useMockMode ? mockMessages : aiMessages
  const userName = appState?.userProfile.name ?? 'Captain'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isBusy, messages])

  useEffect(() => {
    if (AI_CONFIG.useMockMode) return
    if (status !== 'ready' || aiMessages.length === 0) return

    const lastMessage = aiMessages[aiMessages.length - 1]
    if (lastMessage.role !== 'assistant') return

    const assistantText = getTextContent(lastMessage)
    const parsedAssistantAction = parseAIAction(assistantText)
    const actionToApply = parsedAssistantAction ?? pendingActionRef.current
    if (actionToApply) {
      onStateUpdate?.(actionToApply)
      pendingActionRef.current = undefined
    }
  }, [aiMessages, onStateUpdate, status])

  const sendMockMessage = async (text: string) => {
    mockCounterRef.current += 1
    const userCounter = mockCounterRef.current
    const userMessage: ChatMessage = {
      id: `mock-user-${userCounter}`,
      role: 'user',
      content: text,
      timestamp: userCounter,
    }

    setMockMessages((prev) => [...prev, userMessage])
    setIsMockLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 700))

    const result = generateMockSuggestion(text)
    mockCounterRef.current += 1
    const replyCounter = mockCounterRef.current
    setMockMessages((prev) => [
      ...prev,
      {
        id: `mock-assistant-${replyCounter}`,
        role: 'assistant',
        content: result.text,
        timestamp: replyCounter,
      },
    ])
    setIsMockLoading(false)

    if (result.action) {
      onStateUpdate?.(result.action)
    }
  }

  const sendLiveMessage = async (text: string) => {
    pendingActionRef.current = parseAIAction(text)
    await sendMessage({ text }, { body: { userState: appState } })
  }

  const handleSend = async (preset?: string) => {
    const nextMessage = (preset ?? input).trim()
    if (!nextMessage) return

    setInput('')

    if (AI_CONFIG.useMockMode) {
      await sendMockMessage(nextMessage)
      return
    }

    await sendLiveMessage(nextMessage)
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-navy pirate-page lg:h-full">
      <div className="sticky top-0 z-10 border-b border-brass/12 bg-ink/90 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <CaptainBenjaminPortrait className="h-14 w-14 overflow-hidden rounded-full border border-brass/25" compact />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal">Capt. Benjamin</p>
            <h1 className="mt-1 text-xl font-semibold text-bone">Quartermaster for {userName}</h1>
            <p className="mt-1 text-xs leading-5 text-sand/68">Ask about today&apos;s savings, your next storm, or the leak worth patching first.</p>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => void handleSend(prompt)}
            className="shrink-0 rounded-full border border-brass/18 bg-wood-light/40 px-4 py-2 text-xs font-semibold text-sand transition-colors active:bg-wood-light/70"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-8 scrollbar-pirate">
        {messages.map((message) => {
          const text = getTextContent(message)
          const isUser = message.role === 'user'

          return (
            <div key={message.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <CaptainBenjaminPortrait className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brass/25" compact />
              )}
              <div className={`max-w-[84%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isUser && (
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brass">
                    Capt. Benjamin
                  </p>
                )}
                <div
                  className={`rounded-[24px] px-4 py-3 ${
                    isUser
                      ? 'rounded-tr-md bg-brass text-ink'
                      : 'rounded-tl-md border border-brass/12 bg-ink/48 text-bone'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{text || '...'}</p>
                </div>
              </div>
            </div>
          )
        })}

        {!AI_CONFIG.useMockMode && error && (
          <div className="rounded-[24px] border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            Capt. Benjamin could not reach the live service just now.
          </div>
        )}

        {isBusy && (
          <div className="flex justify-start gap-2">
            <CaptainBenjaminPortrait className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brass/25" compact />
            <div className="rounded-[24px] rounded-tl-md border border-brass/12 bg-ink/48 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-sand/75">
                <Loader2 className="h-4 w-4 animate-spin text-brass" />
                Capt. Benjamin is checking the charts.
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-brass/12 bg-ink/92 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md">
        {AI_CONFIG.useMockMode && (
          <p className="mb-2 text-center text-xs text-sand/60">Demo mode. Set `NEXT_PUBLIC_APP_MODE=live` to use the live assistant.</p>
        )}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-brass/18 bg-wood-light/35 px-4">
            <Compass className="h-4 w-4 shrink-0 text-brass" />
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void handleSend()
                }
              }}
              placeholder="Benjamin, where should I steer today?"
              className="h-12 w-full bg-transparent text-sm text-bone placeholder:text-sand/42 focus:outline-none"
              disabled={isBusy}
            />
          </div>
          <button
            onClick={() => void handleSend()}
            disabled={isBusy || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brass text-ink shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
