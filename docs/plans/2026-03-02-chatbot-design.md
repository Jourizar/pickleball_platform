# AI Chatbot Design — 2026-03-02

## Goal

Add a lightweight AI chatbot that helps users with questions about the club. Available to everyone on all pages. Logged-out users get general info only; logged-in users also get live court availability.

## Architecture

**API route: `app/api/chat/route.ts`**
- Accepts POST with `{ messages: {role, content}[] }`
- Reads Supabase session server-side to determine auth state
- If logged in: queries `courts` and today's `time_slots` from Supabase, injects into context
- Calls Anthropic SDK (`claude-haiku-4-5-20251001`) with streaming
- System prompt contains: club name, courts, membership plans, pricing, pickleball basics
- If logged out: system prompt instructs Claude not to discuss court availability

**UI: `components/ui/ChatBot.tsx`**
- `'use client'` component
- Floating yellow button, fixed bottom-right, z-50
- Opens a slide-up chat panel (max-width ~380px, fixed height)
- Conversation history in React state (resets on page reload)
- Text input + send button, loading indicator while streaming
- Added to `app/[locale]/layout.tsx` so it appears on every page

## Model

`claude-haiku-4-5-20251001` — fast and low-cost, appropriate for a chat assistant.

## Environment Variables

- `ANTHROPIC_API_KEY` — server-only (no NEXT_PUBLIC_ prefix), added to Vercel

## Data Flow

1. User types message → client appends to `messages` state → POST `/api/chat`
2. Route checks session → builds system prompt → calls Claude API with full message history
3. Streams response back → client reads stream → appends assistant message to state

## Auth-awareness

- Logged out: Claude answers general questions, redirects court availability questions to "please log in"
- Logged in: Claude receives today's time slots and can answer availability questions
