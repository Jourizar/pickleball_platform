'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatBotProps {
  locale: string
  userName?: string
}

export default function ChatBot({ locale, userName }: ChatBotProps) {
  const t = useTranslations('helpbot')
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function toggleOpen() {
    if (open) {
      abortRef.current?.abort()
      setOpen(false)
    } else {
      setOpen(true)
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, locale }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) throw new Error(`Request failed: ${response.status}`)

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Lo siento, hubo un error. Por favor intenta de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-[#050e07] shadow-lg shadow-yellow-400/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Open chat assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] h-[500px] bg-[#050e07] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center">
              <span className="text-yellow-400 text-xs font-bold font-display">NP</span>
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">{t('title')}</p>
              <p className="font-body text-xs text-white/30">Nell Pickleball Club</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center font-body text-sm text-white/30 mt-10">
                {userName ? `¡Hola, ${userName}! ¿En qué puedo ayudarte?` : '¿En qué puedo ayudarte?'}
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-xl font-body text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-yellow-400 text-[#050e07]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {msg.content || <span className="opacity-40">...</span>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/10 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={t('placeholder')}
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 font-body text-sm text-white placeholder-white/30 outline-none focus:border-yellow-400/50 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-yellow-400 hover:bg-yellow-300 text-[#050e07] flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label={t('send')}
            >
              <Send size={14} />
            </button>
          </div>

        </div>
      )}
    </>
  )
}
