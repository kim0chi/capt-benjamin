import type { SupabaseClient } from '@supabase/supabase-js'
import { buildAppStateFromSource, createSeedSourceData, getTodayKey } from '@/lib/demo-state/state'
import type { DemoBillRecord, DemoSourceData, DemoStateAction } from '@/lib/demo-state/types'
import { createSupabaseAdminClient, getSupabaseServerConfig } from '@/lib/supabase/server'

type WorkspaceRow = {
  id: string
  slug: string
  name: string | null
}

type ProfileRow = {
  workspace_id: string
  name: string
  role: string
  income_cadence: string
  current_balance: number
  monthly_income: number
  monthly_expenses: number
  safe_to_spend: number
  days_until_payday: number
}

type GoalRow = {
  id: string
  workspace_id: string
  name: string
  saved_amount: number
  target_amount: number
  weekly_contribution: number
  icon: string
  color: string
  is_priority: boolean | null
}

type BillRow = {
  id: string
  workspace_id: string
  name: string
  due_date: string
  amount: number
  priority: DemoBillRecord['priority']
  icon: string
  status: DemoBillRecord['status'] | null
  remind_at: string | null
  notes: string | null
  handled_at: string | null
}

type JarRow = {
  id: string
  workspace_id: string
  name: string
  icon: string
  color: string
  balance: number
  notes: string | null
}

type LeakRow = {
  id: string
  workspace_id: string
  category: string
  amount: number
  frequency: string
  ai_explanation: string
  icon: string
  color: string
  patched: boolean | null
}

type SavingsEntryRow = {
  id: string
  workspace_id: string
  entry_type: 'deposit' | 'withdrawal'
  amount: number
  date: string
  source_note: string
  created_by: 'manual' | 'kapitan'
  jar_id: string | null
}

type SavingsAllocationRow = {
  id: string
  workspace_id: string
  savings_entry_id: string
  goal_id: string
  amount: number
}

function toProfileRow(workspaceId: string, source: DemoSourceData['profile']): ProfileRow {
  return {
    workspace_id: workspaceId,
    name: source.name,
    role: source.role,
    income_cadence: source.incomeCadence,
    current_balance: source.currentBalance,
    monthly_income: source.monthlyIncome,
    monthly_expenses: source.monthlyExpenses,
    safe_to_spend: source.safeToSpend,
    days_until_payday: source.daysUntilPayday,
  }
}

function toGoalRows(workspaceId: string, goals: DemoSourceData['goals']): GoalRow[] {
  return goals.map((goal) => ({
    id: goal.id,
    workspace_id: workspaceId,
    name: goal.name,
    saved_amount: goal.savedAmount,
    target_amount: goal.targetAmount,
    weekly_contribution: goal.weeklyContribution,
    icon: goal.icon,
    color: goal.color,
    is_priority: goal.isPriority ?? false,
  }))
}

function toBillRows(workspaceId: string, bills: DemoSourceData['bills']): BillRow[] {
  return bills.map((bill) => ({
    id: bill.id,
    workspace_id: workspaceId,
    name: bill.name,
    due_date: bill.dueDate,
    amount: bill.amount,
    priority: bill.priority,
    icon: bill.icon,
    status: bill.status,
    remind_at: bill.remindAt ?? null,
    notes: bill.notes ?? null,
    handled_at: bill.handledAt ?? null,
  }))
}

function toJarRows(workspaceId: string, jars: DemoSourceData['jars']): JarRow[] {
  return jars.map((jar) => ({
    id: jar.id,
    workspace_id: workspaceId,
    name: jar.name,
    icon: jar.icon,
    color: jar.color,
    balance: jar.balance,
    notes: jar.notes ?? null,
  }))
}

function toLeakRows(workspaceId: string, leaks: DemoSourceData['leaks']): LeakRow[] {
  return leaks.map((leak) => ({
    id: leak.id,
    workspace_id: workspaceId,
    category: leak.category,
    amount: leak.amount,
    frequency: leak.frequency,
    ai_explanation: leak.aiExplanation,
    icon: leak.icon,
    color: leak.color,
    patched: leak.patched ?? false,
  }))
}

function toSavingsEntryRows(
  workspaceId: string,
  entries: DemoSourceData['savingsEntries'],
): { entries: SavingsEntryRow[]; allocations: SavingsAllocationRow[] } {
  const allocations: SavingsAllocationRow[] = []

  const normalizedEntries = entries.map((entry) => {
    entry.allocations.forEach((allocation, index) => {
      allocations.push({
        id: `${entry.id}-${index}`,
        workspace_id: workspaceId,
        savings_entry_id: entry.id,
        goal_id: allocation.goalId,
        amount: allocation.amount,
      })
    })

    return {
      id: entry.id,
      workspace_id: workspaceId,
      entry_type: entry.type,
      amount: entry.amount,
      date: entry.date,
      source_note: entry.sourceNote,
      created_by: entry.createdBy,
      jar_id: entry.jarId ?? null,
    }
  })

  return {
    entries: normalizedEntries,
    allocations,
  }
}

async function ensureWorkspace(client: SupabaseClient) {
  const { workspaceSlug } = getSupabaseServerConfig()
  const existing = await client
    .from('workspaces')
    .select('id, slug, name')
    .eq('slug', workspaceSlug)
    .maybeSingle<WorkspaceRow>()

  if (existing.error) throw existing.error
  if (existing.data) return existing.data.id

  const inserted = await client
    .from('workspaces')
    .insert({
      slug: workspaceSlug,
      name: 'Kapitan Demo Workspace',
    })
    .select('id, slug, name')
    .single<WorkspaceRow>()

  if (inserted.error) throw inserted.error
  return inserted.data.id
}

async function seedWorkspace(client: SupabaseClient, workspaceId: string) {
  const seed = createSeedSourceData()
  const { entries, allocations } = toSavingsEntryRows(workspaceId, seed.savingsEntries)

  const deleteTables = [
    'savings_entry_allocations',
    'savings_entries',
    'jars',
    'goals',
    'bills',
    'leaks',
    'profiles',
  ] as const

  for (const table of deleteTables) {
    const result = await client.from(table).delete().eq('workspace_id', workspaceId)
    if (result.error) throw result.error
  }

  const profileResult = await client.from('profiles').insert(toProfileRow(workspaceId, seed.profile))
  if (profileResult.error) throw profileResult.error

  const goalsResult = await client.from('goals').insert(toGoalRows(workspaceId, seed.goals))
  if (goalsResult.error) throw goalsResult.error

  const billsResult = await client.from('bills').insert(toBillRows(workspaceId, seed.bills))
  if (billsResult.error) throw billsResult.error

  const jarsResult = await client.from('jars').insert(toJarRows(workspaceId, seed.jars))
  if (jarsResult.error) throw jarsResult.error

  const leaksResult = await client.from('leaks').insert(toLeakRows(workspaceId, seed.leaks))
  if (leaksResult.error) throw leaksResult.error

  const savingsEntriesResult = await client.from('savings_entries').insert(entries)
  if (savingsEntriesResult.error) throw savingsEntriesResult.error

  if (allocations.length > 0) {
    const allocationsResult = await client.from('savings_entry_allocations').insert(allocations)
    if (allocationsResult.error) throw allocationsResult.error
  }
}

async function loadSourceData(client: SupabaseClient, workspaceId: string): Promise<DemoSourceData> {
  const [profileResult, goalsResult, billsResult, jarsResult, leaksResult, entriesResult, allocationsResult] =
    await Promise.all([
      client.from('profiles').select('*').eq('workspace_id', workspaceId).maybeSingle<ProfileRow>(),
      client.from('goals').select('*').eq('workspace_id', workspaceId).order('id', { ascending: true }).returns<GoalRow[]>(),
      client.from('bills').select('*').eq('workspace_id', workspaceId).order('due_date', { ascending: true }).returns<BillRow[]>(),
      client.from('jars').select('*').eq('workspace_id', workspaceId).order('id', { ascending: true }).returns<JarRow[]>(),
      client.from('leaks').select('*').eq('workspace_id', workspaceId).order('id', { ascending: true }).returns<LeakRow[]>(),
      client.from('savings_entries').select('*').eq('workspace_id', workspaceId).order('date', { ascending: false }).returns<SavingsEntryRow[]>(),
      client
        .from('savings_entry_allocations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .returns<SavingsAllocationRow[]>(),
    ])

  const results = [profileResult, goalsResult, billsResult, jarsResult, leaksResult, entriesResult, allocationsResult]
  for (const result of results) {
    if (result.error) throw result.error
  }

  if (!profileResult.data) {
    await seedWorkspace(client, workspaceId)
    return loadSourceData(client, workspaceId)
  }

  const seed = createSeedSourceData()
  const allocationMap = new Map<string, SavingsAllocationRow[]>()
  for (const allocation of allocationsResult.data ?? []) {
    const list = allocationMap.get(allocation.savings_entry_id) ?? []
    list.push(allocation)
    allocationMap.set(allocation.savings_entry_id, list)
  }

  return {
    profile: {
      name: profileResult.data.name,
      role: profileResult.data.role,
      incomeCadence: profileResult.data.income_cadence,
      currentBalance: profileResult.data.current_balance,
      monthlyIncome: profileResult.data.monthly_income,
      monthlyExpenses: profileResult.data.monthly_expenses,
      safeToSpend: profileResult.data.safe_to_spend,
      daysUntilPayday: profileResult.data.days_until_payday,
    },
    goals: (goalsResult.data ?? []).map((goal) => ({
      id: goal.id,
      name: goal.name,
      savedAmount: goal.saved_amount,
      targetAmount: goal.target_amount,
      weeklyContribution: goal.weekly_contribution,
      icon: goal.icon,
      color: goal.color,
      isPriority: goal.is_priority ?? false,
    })),
    bills: (billsResult.data ?? []).map((bill) => ({
      id: bill.id,
      name: bill.name,
      dueDate: bill.due_date,
      amount: bill.amount,
      priority: bill.priority,
      icon: bill.icon,
      status: bill.status ?? 'upcoming',
      remindAt: bill.remind_at ?? undefined,
      notes: bill.notes ?? undefined,
      handledAt: bill.handled_at ?? undefined,
    })),
    jars: (jarsResult.data ?? []).map((jar) => ({
      id: jar.id,
      name: jar.name,
      icon: jar.icon,
      color: jar.color,
      balance: jar.balance,
      notes: jar.notes ?? undefined,
    })),
    leaks: (leaksResult.data ?? []).map((leak) => ({
      id: leak.id,
      category: leak.category,
      amount: leak.amount,
      frequency: leak.frequency,
      aiExplanation: leak.ai_explanation,
      icon: leak.icon,
      color: leak.color,
      patched: leak.patched ?? false,
    })),
    savingsEntries: (entriesResult.data ?? []).map((entry) => ({
      id: entry.id,
      type: entry.entry_type,
      amount: entry.amount,
      date: entry.date,
      sourceNote: entry.source_note,
      createdBy: entry.created_by,
      allocations: (allocationMap.get(entry.id) ?? []).map((allocation) => ({
        goalId: allocation.goal_id,
        amount: allocation.amount,
      })),
      ...(entry.jar_id ? { jarId: entry.jar_id } : {}),
    })),
    transactions: seed.transactions,
  }
}

async function getGoalRow(client: SupabaseClient, workspaceId: string, goalId: string) {
  const result = await client
    .from('goals')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('id', goalId)
    .maybeSingle<GoalRow>()
  if (result.error) throw result.error
  return result.data
}

async function getJarRow(client: SupabaseClient, workspaceId: string, jarId: string) {
  const result = await client
    .from('jars')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('id', jarId)
    .maybeSingle<JarRow>()
  if (result.error) throw result.error
  return result.data
}

async function getProfileRow(client: SupabaseClient, workspaceId: string) {
  const result = await client.from('profiles').select('*').eq('workspace_id', workspaceId).single<ProfileRow>()
  if (result.error) throw result.error
  return result.data
}

async function updateProfileBalance(client: SupabaseClient, workspaceId: string, delta: number) {
  const profile = await getProfileRow(client, workspaceId)
  const result = await client
    .from('profiles')
    .update({ current_balance: profile.current_balance + delta })
    .eq('workspace_id', workspaceId)
  if (result.error) throw result.error
}

async function applyAction(client: SupabaseClient, workspaceId: string, action: DemoStateAction) {
  switch (action.type) {
    case 'PATCH_LEAK': {
      const result = await client
        .from('leaks')
        .update({ patched: true })
        .eq('workspace_id', workspaceId)
        .eq('id', action.id)
      if (result.error) throw result.error
      return
    }
    case 'PRIORITIZE_GOAL': {
      const reset = await client.from('goals').update({ is_priority: false }).eq('workspace_id', workspaceId)
      if (reset.error) throw reset.error
      const focus = await client
        .from('goals')
        .update({ is_priority: true })
        .eq('workspace_id', workspaceId)
        .eq('id', action.id)
      if (focus.error) throw focus.error
      return
    }
    case 'LOG_SAVINGS': {
      const roundedAmount = Math.max(0, Math.round(action.amount))
      if (roundedAmount <= 0) return

      const entryId = `${getTodayKey()}-${Date.now()}`
      const entryResult = await client.from('savings_entries').insert({
        id: entryId,
        workspace_id: workspaceId,
        entry_type: 'deposit',
        amount: roundedAmount,
        date: getTodayKey(),
        source_note: action.sourceNote.trim() || 'Manual savings log',
        created_by: action.createdBy ?? 'manual',
        jar_id: action.jarId ?? null,
      })
      if (entryResult.error) throw entryResult.error

      const allocations = action.allocations
        .filter((allocation) => allocation.amount > 0)
        .map((allocation, index) => ({
          id: `${entryId}-${index}`,
          workspace_id: workspaceId,
          savings_entry_id: entryId,
          goal_id: allocation.goalId,
          amount: Math.round(allocation.amount),
        }))

      if (allocations.length > 0) {
        const allocationResult = await client.from('savings_entry_allocations').insert(allocations)
        if (allocationResult.error) throw allocationResult.error
      }

      for (const allocation of allocations) {
        const goal = await getGoalRow(client, workspaceId, allocation.goal_id)
        if (!goal) continue
        const updateGoal = await client
          .from('goals')
          .update({
            saved_amount: Math.min(goal.target_amount, goal.saved_amount + allocation.amount),
          })
          .eq('workspace_id', workspaceId)
          .eq('id', allocation.goal_id)
        if (updateGoal.error) throw updateGoal.error
      }

      if (action.jarId) {
        const jar = await getJarRow(client, workspaceId, action.jarId)
        if (jar) {
          const jarResult = await client
            .from('jars')
            .update({ balance: jar.balance + roundedAmount })
            .eq('workspace_id', workspaceId)
            .eq('id', action.jarId)
          if (jarResult.error) throw jarResult.error
        }
      }

      await updateProfileBalance(client, workspaceId, roundedAmount)
      return
    }
    case 'ADD_GOAL': {
      const result = await client.from('goals').insert({
        id: `goal-${Date.now()}`,
        workspace_id: workspaceId,
        name: action.name.trim(),
        saved_amount: 0,
        target_amount: action.targetAmount,
        weekly_contribution: 0,
        icon: 'Star',
        color: 'from-teal to-sky',
        is_priority: false,
      })
      if (result.error) throw result.error
      return
    }
    case 'ADD_BILL': {
      const result = await client.from('bills').insert({
        id: `bill-${Date.now()}`,
        workspace_id: workspaceId,
        name: action.bill.name,
        due_date: action.bill.dueDate,
        amount: action.bill.amount,
        priority: action.bill.priority,
        icon: action.bill.icon,
        status: 'upcoming',
        remind_at: action.bill.remindAt ?? null,
        notes: action.bill.notes ?? null,
        handled_at: action.bill.handledAt ?? null,
      })
      if (result.error) throw result.error
      return
    }
    case 'MARK_BILL_HANDLED': {
      const result = await client
        .from('bills')
        .update({
          status: 'handled',
          handled_at: getTodayKey(),
          remind_at: null,
        })
        .eq('workspace_id', workspaceId)
        .eq('id', action.id)
      if (result.error) throw result.error
      return
    }
    case 'DELETE_BILL': {
      const result = await client.from('bills').delete().eq('workspace_id', workspaceId).eq('id', action.id)
      if (result.error) throw result.error
      return
    }
    case 'SNOOZE_BILL': {
      const result = await client
        .from('bills')
        .update({
          status: 'remind_later',
          remind_at: action.remindAt,
          handled_at: null,
        })
        .eq('workspace_id', workspaceId)
        .eq('id', action.id)
      if (result.error) throw result.error
      return
    }
    case 'ADD_JAR': {
      const result = await client.from('jars').insert({
        id: `jar-${Date.now()}`,
        workspace_id: workspaceId,
        name: action.name.trim(),
        icon: action.icon,
        color: action.color,
        balance: 0,
        notes: null,
      })
      if (result.error) throw result.error
      return
    }
    case 'DEPOSIT_TO_JAR': {
      const roundedAmount = Math.max(0, Math.round(action.amount))
      if (roundedAmount <= 0) return

      const jar = await getJarRow(client, workspaceId, action.jarId)
      if (!jar) return

      const jarResult = await client
        .from('jars')
        .update({ balance: jar.balance + roundedAmount })
        .eq('workspace_id', workspaceId)
        .eq('id', action.jarId)
      if (jarResult.error) throw jarResult.error

      const entryResult = await client.from('savings_entries').insert({
        id: `${getTodayKey()}-jar-${Date.now()}`,
        workspace_id: workspaceId,
        entry_type: 'deposit',
        amount: roundedAmount,
        date: getTodayKey(),
        source_note: 'Jar deposit',
        created_by: 'manual',
        jar_id: action.jarId,
      })
      if (entryResult.error) throw entryResult.error
      return
    }
    case 'WITHDRAW_FROM_JAR': {
      const roundedAmount = Math.max(0, Math.round(action.amount))
      if (roundedAmount <= 0) return

      const jar = await getJarRow(client, workspaceId, action.jarId)
      if (!jar) return

      const jarResult = await client
        .from('jars')
        .update({ balance: Math.max(0, jar.balance - roundedAmount) })
        .eq('workspace_id', workspaceId)
        .eq('id', action.jarId)
      if (jarResult.error) throw jarResult.error

      const entryResult = await client.from('savings_entries').insert({
        id: `${getTodayKey()}-withdraw-${Date.now()}`,
        workspace_id: workspaceId,
        entry_type: 'withdrawal',
        amount: roundedAmount,
        date: getTodayKey(),
        source_note: action.sourceNote.trim() || 'Withdrawal',
        created_by: 'manual',
        jar_id: action.jarId,
      })
      if (entryResult.error) throw entryResult.error
      return
    }
    case 'PAY_BILL': {
      const billResult = await client
        .from('bills')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('id', action.billId)
        .maybeSingle<BillRow>()
      if (billResult.error) throw billResult.error

      const bill = billResult.data
      if (!bill) return

      const jar = await getJarRow(client, workspaceId, action.jarId)
      if (!jar) return

      const updateBill = await client
        .from('bills')
        .update({
          status: 'handled',
          handled_at: getTodayKey(),
          remind_at: null,
        })
        .eq('workspace_id', workspaceId)
        .eq('id', action.billId)
      if (updateBill.error) throw updateBill.error

      const jarResult = await client
        .from('jars')
        .update({ balance: Math.max(0, jar.balance - bill.amount) })
        .eq('workspace_id', workspaceId)
        .eq('id', action.jarId)
      if (jarResult.error) throw jarResult.error

      const entryResult = await client.from('savings_entries').insert({
        id: `${getTodayKey()}-bill-${Date.now()}`,
        workspace_id: workspaceId,
        entry_type: 'withdrawal',
        amount: bill.amount,
        date: getTodayKey(),
        source_note: `Bill payment: ${bill.name}`,
        created_by: 'manual',
        jar_id: action.jarId,
      })
      if (entryResult.error) throw entryResult.error
      return
    }
    case 'APPLY_ONBOARDING': {
      const profile = await getProfileRow(client, workspaceId)
      const updateProfile = await client
        .from('profiles')
        .update({
          name: action.answers.name.trim() || profile.name,
          role: action.answers.role.trim() || profile.role,
          income_cadence: action.answers.incomeCadence.trim() || profile.income_cadence,
        })
        .eq('workspace_id', workspaceId)
      if (updateProfile.error) throw updateProfile.error

      const goalsResult = await client
        .from('goals')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('id', { ascending: true })
        .returns<GoalRow[]>()
      if (goalsResult.error) throw goalsResult.error
      const goals = goalsResult.data ?? []
      const currentPriorityId = goals.find((goal) => goal.is_priority)?.id ?? goals[0]?.id

      if (currentPriorityId) {
        const clearResult = await client.from('goals').update({ is_priority: false }).eq('workspace_id', workspaceId)
        if (clearResult.error) throw clearResult.error

        const focusGoal = goals.find((goal) => goal.id === currentPriorityId)
        const updateGoal = await client
          .from('goals')
          .update({
            is_priority: true,
            name: action.answers.primaryGoal.trim() || focusGoal?.name || 'Main Goal',
          })
          .eq('workspace_id', workspaceId)
          .eq('id', currentPriorityId)
        if (updateGoal.error) throw updateGoal.error
      }

      const pressurePoint = action.answers.pressurePoint.trim()
      if (pressurePoint) {
        const billsResult = await client
          .from('bills')
          .select('id')
          .eq('workspace_id', workspaceId)
          .order('due_date', { ascending: true })
          .limit(1)
        if (billsResult.error) throw billsResult.error
        const firstBillId = billsResult.data?.[0]?.id as string | undefined
        if (firstBillId) {
          const billUpdate = await client
            .from('bills')
            .update({ name: pressurePoint })
            .eq('workspace_id', workspaceId)
            .eq('id', firstBillId)
          if (billUpdate.error) throw billUpdate.error
        }
      }
      return
    }
    case 'RESET_DEMO':
      await seedWorkspace(client, workspaceId)
      return
  }
}

export async function getDemoStateSnapshot() {
  const client = createSupabaseAdminClient()
  const workspaceId = await ensureWorkspace(client)
  const source = await loadSourceData(client, workspaceId)
  return buildAppStateFromSource(source)
}

export async function runDemoStateAction(action: DemoStateAction) {
  const client = createSupabaseAdminClient()
  const workspaceId = await ensureWorkspace(client)

  if (action.type === 'RESET_DEMO') {
    await seedWorkspace(client, workspaceId)
  } else {
    const profileExists = await client
      .from('profiles')
      .select('workspace_id')
      .eq('workspace_id', workspaceId)
      .maybeSingle<{ workspace_id: string }>()
    if (profileExists.error) throw profileExists.error
    if (!profileExists.data) {
      await seedWorkspace(client, workspaceId)
    }
    await applyAction(client, workspaceId, action)
  }

  const source = await loadSourceData(client, workspaceId)
  return buildAppStateFromSource(source)
}
