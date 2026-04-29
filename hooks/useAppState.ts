'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { parseDemoStateAction } from '@/lib/demo-state/actions'
import { applyDemoAction, createSeedAppState, hydrateSnapshot } from '@/lib/demo-state/state'
import type { DemoStateResponse } from '@/lib/demo-state/types'
import type { AppState, DemoOnboardingAnswers, SavingsAllocation, StormWarning } from '@/types'

const STORAGE_KEY = 'kapitan-state'

type UseAppStateOptions = {
  enableRemoteSync?: boolean
}

function loadCachedSnapshot() {
  if (typeof window === 'undefined') return createSeedAppState()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return hydrateSnapshot(JSON.parse(stored) as Partial<AppState>)
  } catch {
    // ignore parse errors
  }

  return createSeedAppState()
}

async function parseSnapshotResponse(response: Response) {
  const payload = (await response.json()) as Partial<DemoStateResponse> & { error?: string }
  if (!response.ok || !payload.snapshot) {
    throw new Error(payload.error || 'Unexpected demo state response.')
  }
  return hydrateSnapshot(payload.snapshot)
}

export function useAppState(options: UseAppStateOptions = {}) {
  const enableRemoteSync = options.enableRemoteSync ?? true
  const [state, setState] = useState<AppState>(() => loadCachedSnapshot())
  const hasShownSyncWarningRef = useRef(false)
  const hasFetchedRemoteRef = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    if (!enableRemoteSync || hasFetchedRemoteRef.current) return

    hasFetchedRemoteRef.current = true
    let cancelled = false

    void (async () => {
      try {
        const response = await fetch('/api/demo-state', {
          method: 'GET',
          cache: 'no-store',
        })
        const snapshot = await parseSnapshotResponse(response)
        if (!cancelled) {
          setState(snapshot)
          hasShownSyncWarningRef.current = false
        }
      } catch {
        if (!cancelled && !hasShownSyncWarningRef.current) {
          hasShownSyncWarningRef.current = true
          toast.error('Supabase sync is unavailable. Using local demo data for now.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enableRemoteSync])

  const syncAction = useCallback(
    async (action: ReturnType<typeof parseDemoStateAction>) => {
      if (!enableRemoteSync) return

      try {
        const response = await fetch('/api/demo-state/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        })
        const snapshot = await parseSnapshotResponse(response)
        setState(snapshot)
        hasShownSyncWarningRef.current = false
      } catch {
        if (!hasShownSyncWarningRef.current) {
          hasShownSyncWarningRef.current = true
          toast.error('Changes are saved only on this device until Supabase sync is available again.')
        }
      }
    },
    [enableRemoteSync],
  )

  const dispatch = useCallback(
    (action: ReturnType<typeof parseDemoStateAction>) => {
      setState((prev) => applyDemoAction(prev, action))
      void syncAction(action)
    },
    [syncAction],
  )

  const patchLeak = useCallback((id: string) => {
    dispatch(parseDemoStateAction({ type: 'PATCH_LEAK', id }))
  }, [dispatch])

  const prioritizeGoal = useCallback((id: string) => {
    dispatch(parseDemoStateAction({ type: 'PRIORITIZE_GOAL', id }))
  }, [dispatch])

  const logSavingsEntry = useCallback(
    (
      amount: number,
      allocations: SavingsAllocation[],
      sourceNote: string,
      createdBy: 'manual' | 'kapitan' = 'manual',
      jarId?: string,
    ) => {
      dispatch(
        parseDemoStateAction({
          type: 'LOG_SAVINGS',
          amount,
          allocations,
          sourceNote,
          createdBy,
          ...(jarId ? { jarId } : {}),
        }),
      )
    },
    [dispatch],
  )

  const contributeToGoal = useCallback(
    (id: string, amount: number) => {
      logSavingsEntry(amount, [{ goalId: id, amount }], 'Kapitan quick check-in', 'kapitan')
    },
    [logSavingsEntry],
  )

  const addGoal = useCallback((name: string, targetAmount: number) => {
    dispatch(parseDemoStateAction({ type: 'ADD_GOAL', name, targetAmount }))
  }, [dispatch])

  const addBill = useCallback((bill: Omit<StormWarning, 'id' | 'status'>) => {
    dispatch(parseDemoStateAction({ type: 'ADD_BILL', bill }))
  }, [dispatch])

  const markBillHandled = useCallback((id: string) => {
    dispatch(parseDemoStateAction({ type: 'MARK_BILL_HANDLED', id }))
  }, [dispatch])

  const deleteBill = useCallback((id: string) => {
    dispatch(parseDemoStateAction({ type: 'DELETE_BILL', id }))
  }, [dispatch])

  const snoozeBill = useCallback((id: string, remindAt: string) => {
    dispatch(parseDemoStateAction({ type: 'SNOOZE_BILL', id, remindAt }))
  }, [dispatch])

  const addJar = useCallback((name: string, icon: string, color: string) => {
    dispatch(parseDemoStateAction({ type: 'ADD_JAR', name, icon, color }))
  }, [dispatch])

  const depositToJar = useCallback((jarId: string, amount: number) => {
    dispatch(parseDemoStateAction({ type: 'DEPOSIT_TO_JAR', jarId, amount }))
  }, [dispatch])

  const withdrawFromJar = useCallback((jarId: string, amount: number, sourceNote: string) => {
    dispatch(parseDemoStateAction({ type: 'WITHDRAW_FROM_JAR', jarId, amount, sourceNote }))
  }, [dispatch])

  const payBill = useCallback((billId: string, jarId: string) => {
    dispatch(parseDemoStateAction({ type: 'PAY_BILL', billId, jarId }))
  }, [dispatch])

  const applyOnboarding = useCallback((answers: DemoOnboardingAnswers) => {
    dispatch(parseDemoStateAction({ type: 'APPLY_ONBOARDING', answers }))
  }, [dispatch])

  const resetDemo = useCallback(() => {
    dispatch(parseDemoStateAction({ type: 'RESET_DEMO' }))
  }, [dispatch])

  return {
    state,
    patchLeak,
    prioritizeGoal,
    contributeToGoal,
    logSavingsEntry,
    addGoal,
    addBill,
    markBillHandled,
    deleteBill,
    snoozeBill,
    addJar,
    depositToJar,
    withdrawFromJar,
    payBill,
    applyOnboarding,
    resetDemo,
  }
}
