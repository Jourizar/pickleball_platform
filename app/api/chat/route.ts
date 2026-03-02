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

    type SlotRow = {
      start_time: string
      end_time: string
      max_capacity: number
      courts: { name: string } | null
      reservations: { id: string }[]
    }

    const { data: slots } = await supabase
      .from('time_slots')
      .select(`
        start_time, end_time, max_capacity,
        courts(name),
        reservations(id)
      `)
      .eq('date', today)
      .eq('is_blocked', false)
      .order('start_time') as { data: SlotRow[] | null, error: unknown }

    if (slots && slots.length > 0) {
      const lines = slots.map(slot => {
        const booked = Array.isArray(slot.reservations) ? slot.reservations.length : 0
        const available = slot.max_capacity - booked
        const courtName = slot.courts?.name ?? 'Court'
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
