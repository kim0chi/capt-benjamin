# Kapitan

Kapitan is a mobile-first finance companion built with Next.js 16, React 19, Tailwind CSS 4, Supabase, and the Vercel AI SDK 6.

## Features

- Dashboard, bills, jars, goals, money condition, and chat screens
- Local-first demo flow with optional Supabase-backed shared demo data
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

This keeps chat fully local and uses mock responses from Kapitan.

### Live AI Mode

To enable streamed AI chat through `/api/chat`, set:

```env
AI_GATEWAY_API_KEY=your_api_gateway_key
AI_MODEL=openai/gpt-4o-mini
NEXT_PUBLIC_APP_MODE=live
```

The client only sees `NEXT_PUBLIC_APP_MODE`. The API key remains server-only.

## Supabase Demo Backend

Kapitan can run with local-only demo state, but the current app also supports a shared Supabase demo workspace behind server API routes.

1. Create a Supabase project.
2. Run the SQL in [supabase/migrations/20260429_init_kapitan_demo.sql](supabase/migrations/20260429_init_kapitan_demo.sql).
3. Add these server-only env vars to `.env.local`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DEMO_WORKSPACE_SLUG=default-demo
```

If these env vars are missing or the schema has not been applied, the app falls back to local cached demo data and shows a sync warning instead of breaking.

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
