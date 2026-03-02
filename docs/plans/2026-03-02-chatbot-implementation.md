# AI Chatbot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a floating AI chatbot powered by Claude Haiku that answers club questions for all users and shows court availability for logged-in users.

**Architecture:** A Next.js API route reads the Supabase session, builds a context-aware system prompt, and streams a Claude Haiku response. A persistent floating button in the layout opens a chat panel that streams the response word-by-word.

**Tech Stack:** Next.js App Router, `@anthropic-ai/sdk` (already installed), `@supabase/ssr`, `lucide-react`, TypeScript

---

### Task 1: Create the chat API route

**Files:**
- Create: `app/api/chat/route.ts`

**Step 1: Create the file with this exact content**

```typescript
// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic()

const BASE_SYSTEM_PROMPT = `You are a friendly assistant for Nell Pickleball Club — the first pickleball club in the Dominican Republic.

Club facts:
- Name: Nell Pickleball Club (Nell PBC)
- Location: Dominican Republic
- 3 courts: Norte (North), Sur (South), Este (East)
- Each reservation slot is 45 minutes + 10 minutes grace period
- Membership plans:
  * Mini (under 14 years): RD$1,500/month — court access Mon–Sat 8am–5pm, 2 group classes/week
  * Individual (14+): RD$3,000/month — unlimited access Mon–Sun 7am–9pm, 4 group classes/week, free tournament entry, 1 guest/month
  * Familiar (up to 4 members): RD$7,500/month — all Individual benefits for up to 4 family members, priority reservations, 2 guests/month

About pickleball:
- A paddle sport combining elements of tennis, badminton, and ping-pong
- Played on a smaller court with a perforated plastic ball
- Easy to learn, great for all ages and fitness levels
- Scoring goes to 11 (win by 2), rally scoring

Rules:
- Members must book courts in advance through the reservations page
- Arrive within the 10-minute grace period or the slot may be forfeited
- Cancellations should be made as early as possible

Contact: Members can reach us via WhatsApp for further assistance.

Answer in the same language the user writes in (Spanish or English). Keep answers concise, warm, and helpful. If you don't know something specific, suggest they contact the club via WhatsApp.`

export async function POST(request: NextRequest) {
  const { messages } = await request.json()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let systemPrompt = BASE_SYSTEM_PROMPT

  if (user) {
    const today = new Date().toISOString().split('T')[0]
    const { data: slots } = await supabase
      .from('time_slots')
      .select(`
        start_time, end_time, max_capacity, is_blocked,
        courts(name),
        reservations(id)
      `)
      .eq('date', today)
      .eq('is_blocked', false)
      .order('start_time')

    if (slots && slots.length > 0) {
      const lines = slots.map(slot => {
        const booked = Array.isArray(slot.reservations) ? slot.reservations.length : 0
        const available = slot.max_capacity - booked
        const courtName = (slot.courts as { name: string } | null)?.name ?? 'Court'
        return `- ${courtName}: ${slot.start_time}–${slot.end_time} (${available} of ${slot.max_capacity} spots free)`
      })
      systemPrompt += `\n\nToday's court availability (${today}):\n${lines.join('\n')}`
    } else {
      systemPrompt += `\n\nToday's court availability: No slots are configured for today. Suggest the user check back later or contact via WhatsApp.`
    }
  } else {
    systemPrompt += `\n\nIMPORTANT: This user is NOT logged in. Do NOT share court availability or slot times. If they ask about availability or booking, tell them they need to log in or create a free account first.`
  }

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: systemPrompt,
    messages,
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

**Step 2: Verify the file**

Confirm:
- `@anthropic-ai/sdk` is imported as `Anthropic` (default import)
- `createClient` is from `@/lib/supabase/server`
- `user` check gates court availability in the system prompt
- Response is a `ReadableStream` with `text/plain` content type

**Step 3: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat: add Claude Haiku chat API route with auth-aware court availability"
```

---

### Task 2: Create the ChatBot UI component

**Files:**
- Create: `components/ui/ChatBot.tsx`

**Step 1: Create the file with this exact content**

```typescript
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
}

export default function ChatBot({ locale }: ChatBotProps) {
  const t = useTranslations('helpbot')
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok || !response.body) throw new Error('Request failed')

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
    } catch {
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
        onClick={() => setOpen(v => !v)}
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
                ¿En qué puedo ayudarte?
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
```

**Step 2: Verify the file**

Confirm:
- Floating button is `fixed bottom-6 right-6 z-50`
- Chat panel is `fixed bottom-24 right-6 z-50`
- Streaming works: empty assistant message added first, then chunks appended
- `locale` prop is accepted (passed from layout for future use)
- `useTranslations('helpbot')` uses existing translation keys

**Step 3: Commit**

```bash
git add components/ui/ChatBot.tsx
git commit -m "feat: add floating ChatBot component with streaming support"
```

---

### Task 3: Add ChatBot to the locale layout

**Files:**
- Modify: `app/[locale]/layout.tsx`

The layout is a server component. `ChatBot` is a client component. Import it and add it just before the closing `</div>` of the root wrapper.

**Step 1: Add import**

In `app/[locale]/layout.tsx`, add this import alongside the existing ones:

```typescript
import ChatBot from '@/components/ui/ChatBot'
```

**Step 2: Add ChatBot to JSX**

Find the return statement. Add `<ChatBot locale={locale} />` as the last child inside the outer `<div className="min-h-screen flex flex-col">`:

```typescript
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Header locale={locale} user={authUser} />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer locale={locale} />
        <ChatBot locale={locale} />
      </div>
    </NextIntlClientProvider>
  )
```

**Step 3: Verify**

Read `app/[locale]/layout.tsx` and confirm `ChatBot` is imported and rendered inside the provider.

**Step 4: Commit**

```bash
git add "app/[locale]/layout.tsx"
git commit -m "feat: add ChatBot to locale layout for persistent display on all pages"
```

---

### Task 4: Add ANTHROPIC_API_KEY to Vercel and push

**Step 1: Verify env var is set locally**

Check that `ANTHROPIC_API_KEY` is in your `.env.local` file (create it if needed):

```
ANTHROPIC_API_KEY=sk-ant-...
```

This variable must NOT have the `NEXT_PUBLIC_` prefix — it should only be available server-side.

**Step 2: Add to Vercel**

Go to your Vercel project → Settings → Environment Variables → add:
- Key: `ANTHROPIC_API_KEY`
- Value: your Anthropic API key
- Environment: Production (and Preview if desired)

**Step 3: Push to trigger redeploy**

```bash
git push origin ecommerceV1:main
```

---

### Task 5: Final verification

**Step 1: Test locally (optional)**

```bash
npm run dev
```

Open `http://localhost:3000/es`. The yellow chat button should appear in the bottom-right corner. Click it, type a question like "¿Cuánto cuesta la membresía individual?" and verify a streaming response appears.

**Step 2: Test auth-awareness**

- Logged out: ask "¿Qué canchas están disponibles?" — the bot should prompt you to log in
- Logged in: same question — the bot should show today's slots (or say none are configured)

**Step 3: Test on Vercel after deploy**

Repeat the above tests on the live URL to confirm `ANTHROPIC_API_KEY` is available server-side.
