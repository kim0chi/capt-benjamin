import { NextResponse } from 'next/server'
import { getDemoStateSnapshot } from '@/lib/demo-state/repository'
import { SupabaseConfigError } from '@/lib/supabase/server'

export async function GET() {
  try {
    const snapshot = await getDemoStateSnapshot()
    return NextResponse.json({ snapshot })
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    console.error('Failed to load Kapitan demo state:', error)
    return NextResponse.json({ error: 'Failed to load demo state.' }, { status: 500 })
  }
}
