# Capt. Benjamin

Capt. Benjamin is a mobile-first finance companion built with Next.js 16, React 19, Tailwind CSS 4, and the Vercel AI SDK 6.

## Features

- Dashboard, leaks, storms, voyage goals, ship condition, and chat screens
- Local mock chat mode for demos
- Live AI chat through the Vercel AI Gateway
- Responsive UI with a premium pirate ledger aesthetic

## Getting Started

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm type-check
```

## Configuration

Copy `.env.local.example` to `.env.local`.

### Demo Mode

Use the default values:

```env
NEXT_PUBLIC_APP_MODE=demo
```

This keeps chat fully local and uses mock responses from Capt. Benjamin.

### Live AI Mode

To enable streamed AI chat through `/api/chat`, set:

```env
AI_GATEWAY_API_KEY=your_api_gateway_key
AI_MODEL=openai/gpt-4o-mini
NEXT_PUBLIC_APP_MODE=live
```

The client only sees `NEXT_PUBLIC_APP_MODE`. The API key remains server-only.

## AI Chat

- The client uses `useChat()` from `@ai-sdk/react`
- The server route at `app/api/chat/route.ts` streams responses with the AI SDK UI message protocol
- Model strings such as `openai/gpt-4o-mini`, `anthropic/claude-sonnet-4.5`, and `google/gemini-2.5-flash` work through the Vercel AI Gateway

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- TypeScript
- Vercel AI SDK 6
