'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Compass, Loader2, Send } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { AI_CONFIG } from '@/lib/ai-config'
import { generateMockSuggestion, parseAIAction } from '@/lib/mock-responses'
import { KapitanAvatar } from '@/components/illustrations/KapitanPortrait'
import type { AIAction, AppState, ChatMessage } from '@/types'

const QUICK_PROMPTS = [
  'I saved P50 today',
  'What bill should I handle first?',
  'Where should my next savings go?',
  'What spending habit should I cut this week?',
  'How much can I safely spend today?',
] as const

interface CaptainChatScreenProps {
  onStateUpdate?: (action: AIAction) => void
  appState?: AppState
  selectedJarId?: string
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

function renderInlineMarkdown(text: string) {
  const nodes: React.ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`${match.index}-strong`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={`${match.index}-code`}
          className="rounded-md bg-black/12 px-1.5 py-0.5 font-mono text-[0.92em] dark:bg-white/8"
        >
          {token.slice(1, -1)}
        </code>,
      )
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : text
}

function AssistantMarkdown({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/)

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').map((line) => line.trimEnd())
        const isBulletList = lines.every((line) => /^[-*]\s+/.test(line))

        if (isBulletList) {
          return (
            <ul key={`block-${blockIndex}`} className="list-disc space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={`line-${lineIndex}`}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={`block-${blockIndex}`} className="whitespace-pre-wrap">
            {lines.map((line, lineIndex) => (
              <React.Fragment key={`line-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                {renderInlineMarkdown(line)}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

export function CaptainChatScreen({ onStateUpdate, appState, selectedJarId }: CaptainChatScreenProps) {
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Start with today. Tell me what you saved, which bill is coming up, or what goal you want to prioritize next.',
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
  const userName = appState?.userProfile.name ?? 'you'

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
          <KapitanAvatar className="h-14 w-14 overflow-hidden rounded-full border border-brass/25" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal">Kapitan</p>
            <h1 className="mt-1 text-xl font-semibold text-bone">Guide for {userName}</h1>
            <p className="mt-1 text-xs leading-5 text-sand/68">
              Ask about today&apos;s savings, upcoming bills, or the spending habit that needs attention first.
            </p>
            <p className="mt-1 text-[11px] text-sand/54">
              {selectedJarId ? 'Using your current jar for quick money actions.' : 'No jar selected for quick money actions.'}
            </p>
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
                <KapitanAvatar className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brass/25" />
              )}
              <div className={`max-w-[84%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isUser && (
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brass">
                    Kapitan
                  </p>
                )}
                <div
                  className={`rounded-[24px] px-4 py-3 ${
                    isUser
                      ? 'rounded-tr-md bg-brass text-ink'
                      : 'rounded-tl-md border border-brass/12 bg-ink/48 text-bone'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{text || '...'}</p>
                  ) : (
                    <AssistantMarkdown text={text || '...'} />
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {!AI_CONFIG.useMockMode && error && (
          <div className="rounded-[24px] border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            Kapitan could not reach the live service just now.
          </div>
        )}

        {isBusy && (
          <div className="flex justify-start gap-2">
            <KapitanAvatar className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brass/25" />
            <div className="rounded-[24px] rounded-tl-md border border-brass/12 bg-ink/48 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-sand/75">
                <Loader2 className="h-4 w-4 animate-spin text-brass" />
                Kapitan is checking your plan.
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
              placeholder="Kapitan, what should I prioritize today?"
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
