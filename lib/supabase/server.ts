import { createClient } from '@supabase/supabase-js'

export class SupabaseConfigError extends Error {
  constructor(message = 'Supabase is not configured for the Kapitan demo backend.') {
    super(message)
    this.name = 'SupabaseConfigError'
  }
}

export function getSupabaseServerConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const workspaceSlug = process.env.SUPABASE_DEMO_WORKSPACE_SLUG

  if (!url || !serviceRoleKey || !workspaceSlug) {
    throw new SupabaseConfigError()
  }

  return {
    url,
    serviceRoleKey,
    workspaceSlug,
  }
}

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseServerConfig()
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
