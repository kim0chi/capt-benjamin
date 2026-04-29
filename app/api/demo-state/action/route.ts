import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { parseDemoStateAction } from '@/lib/demo-state/actions'
import { runDemoStateAction } from '@/lib/demo-state/repository'
import { SupabaseConfigError } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { action?: unknown }
    const action = parseDemoStateAction(body.action)
    const snapshot = await runDemoStateAction(action)
    return NextResponse.json({ snapshot })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid demo action payload.' }, { status: 400 })
    }

    if (error instanceof SupabaseConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    console.error('Failed to apply Kapitan demo action:', error)
    return NextResponse.json({ error: 'Failed to apply demo action.' }, { status: 500 })
  }
}
