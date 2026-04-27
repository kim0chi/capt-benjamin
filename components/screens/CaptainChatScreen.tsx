'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, Compass } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { generateMockSuggestion, parseAIAction } from '@/lib/mock-responses'
import { AI_CONFIG } from '@/lib/ai-config'
import type { AIAction, ChatMessage } from '@/types'

const QUICK_PROMPTS = [
  "Patch food delivery leak",
  "Focus on Emergency Reserve",
  "Chart this week's leaks",
  "What storm hits first?",
  "How much can I safely spend?",
]

interface CaptainChatScreenProps {
  onStateUpdate?: (action: AIAction) => void
}

export function CaptainChatScreen({ onStateUpdate }: CaptainChatScreenProps) {
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        'Welcome aboard. I am Capt. Benjamin. Hand me the ledger, and I will chart the cleanest course through your spending, storms, and savings.',
      timestamp: 0,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages: aiMessages, sendMessage, status, error } = useChat()

  const messages = AI_CONFIG.useMockMode ? mockMessages : aiMessages
  const isAiLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMock = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMockMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    const result = generateMockSuggestion(userMessage.content)
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.text,
      timestamp: Date.now(),
    }

    setMockMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)

    if (result.action) {
      setTimeout(() => onStateUpdate?.(result.action!), 600)
    }
  }

  const handleSendAI = async () => {
    if (!input.trim()) return
    const nextInput = input
    setInput('')
    await sendMessage({ text: nextInput })
  }

  // For live AI: scan response for action keywords after streaming completes
  useEffect(() => {
    if (AI_CONFIG.useMockMode) return
    if (status !== 'ready' || aiMessages.length === 0) return
    const last = aiMessages[aiMessages.length - 1]
    if (last.role !== 'assistant') return
    const text = last.parts?.filter(p => p.type === 'text').map(p => p.text).join('') ?? ''
    const action = parseAIAction(text)
    if (action) onStateUpdate?.(action)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleSend = AI_CONFIG.useMockMode ? handleSendMock : handleSendAI

  const renderMessageContent = (message: typeof aiMessages[number] | ChatMessage) => {
    if ('content' in message) return message.content
    const text = message.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join('')
    return text || '...'
  }

  return (
    <div className="flex h-[calc(100vh-74px)] flex-col bg-navy pirate-page">
      {/* Captain header */}
      <div className="sticky top-0 z-10 border-b border-brass/15 bg-ink/92 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brass/35 bg-wood text-brass shadow-lg shadow-black/30">
            <span className="font-display text-lg font-semibold">CB</span>
          </div>
          <div>
            <p className="pirate-kicker">Quartermaster AI</p>
            <h1 className="font-display text-2xl font-semibold text-bone">Capt. Benjamin</h1>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
              <p className="text-xs text-sand/70">Charting a trustworthy course through your ledger</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3 flex-shrink-0">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => setInput(prompt)}
            className="shrink-0 rounded-full border border-brass/20 bg-wood-light/45 px-4 py-2 text-xs font-semibold text-sand transition-colors active:bg-wood-light/70 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brass/30 bg-wood text-brass">
                <Compass className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-[22px] px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-brass text-ink rounded-tr-md'
                  : 'pirate-panel-soft text-bone rounded-tl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {renderMessageContent(message)}
              </p>
            </div>
          </div>
        ))}

        {!AI_CONFIG.useMockMode && error && (
          <div className="flex justify-start gap-2">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-coral/35 bg-coral/10 text-coral">
              <Compass className="h-4 w-4" />
            </div>
            <div className="max-w-[80%] rounded-[22px] rounded-tl-md border border-coral/35 bg-coral/10 px-4 py-3 text-coral">
              <p className="text-sm">Rough signal. Capt. Benjamin could not reach the live service just now.</p>
            </div>
          </div>
        )}

        {(AI_CONFIG.useMockMode ? isLoading : isAiLoading) && (
          <div className="flex justify-start gap-2">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brass/30 bg-wood text-brass">
              <Compass className="h-4 w-4" />
            </div>
            <div className="rounded-[22px] rounded-tl-md pirate-panel-soft px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-brass" />
                <span className="text-sm text-sand/75">Capt. Benjamin is checking the charts…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-brass/15 bg-ink/92 px-4 py-3 pb-safe backdrop-blur-md flex-shrink-0">
        {AI_CONFIG.useMockMode && (
          <p className="mb-2 text-center text-xs text-sand/60">
            Demo mode · Set NEXT_PUBLIC_APP_MODE=live for live guidance
          </p>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
            placeholder="Hand over the next question from your ledger…"
            className="flex-1 rounded-full border border-brass/18 bg-wood-light/40 px-4 py-3 text-sm text-bone placeholder:text-sand/45 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
            disabled={AI_CONFIG.useMockMode ? isLoading : isAiLoading}
          />
          <button
            onClick={() => { void handleSend() }}
            disabled={(AI_CONFIG.useMockMode ? isLoading : isAiLoading) || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brass text-ink shadow-lg transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(AI_CONFIG.useMockMode ? isLoading : isAiLoading)
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
