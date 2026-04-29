$basePath = "c:\Users\Benedict\Documents\code\Capt. Benjamin"

# ─── useAppState.ts ──────────────────────────────────────────────
$path = "$basePath\hooks\useAppState.ts"
$c = [IO.File]::ReadAllText($path)

# 1. Add SavingsJar to imports
$c = $c.Replace(
  "import type { AppState, DemoOnboardingAnswers, Goal, SavingsAllocation, SavingsEntry, StormWarning } from '@/types'",
  "import type { AppState, DemoOnboardingAnswers, Goal, SavingsAllocation, SavingsEntry, SavingsJar, StormWarning } from '@/types'"
)

# 2. Add jars array before savingsEntries in createInitialState
$oldSeed = "    savingsEntries: [
      {
        id: 'seed-1',"
$newSeed = @"
    jars: [
      { id: 'jar-1', name: 'Emergency Fund', icon: 'Anchor', color: 'from-brass to-sand', balance: 5800 },
      { id: 'jar-2', name: "Anak's Tuition", icon: 'Scroll', color: 'from-sky to-teal', balance: 9500 },
      { id: 'jar-3', name: 'Daily Operations', icon: 'Coins', color: 'from-teal to-sky', balance: 1200 },
    ],
    savingsEntries: [
      {
        id: 'seed-1',
"@
$c = $c.Replace($oldSeed, $newSeed)

# 3. Add jars to hydrateState
$c = $c.Replace(
  "    savingsEntries: raw.savingsEntries ?? initial.savingsEntries,
  }
}",
  "    jars: raw.jars ?? initial.jars,
    savingsEntries: raw.savingsEntries ?? initial.savingsEntries,
  }
}"
)

# 4. Add jarId param to logSavingsEntry
$c = $c.Replace(
  "      createdBy: 'manual' | 'kapitan' = 'manual',
    ) => {
      const roundedAmount = Math.max(0, Math.round(amount))
      if (roundedAmount <= 0) return

      setState((prev) => {
        const today = getTodayKey()
        const normalized = normalizeAllocations(roundedAmount, allocations)
        const entry: SavingsEntry = {
          id: `${today}-${Date.now()}`,
          amount: roundedAmount,
          date: today,
          sourceNote: sourceNote.trim() || 'Manual savings log',
          allocations: normalized,
          createdBy,
        }",
  "      createdBy: 'manual' | 'kapitan' = 'manual',
      jarId?: string,
    ) => {
      const roundedAmount = Math.max(0, Math.round(amount))
      if (roundedAmount <= 0) return

      setState((prev) => {
        const today = getTodayKey()
        const normalized = normalizeAllocations(roundedAmount, allocations)
        const entry: SavingsEntry = {
          id: `${today}-${Date.now()}`,
          amount: roundedAmount,
          date: today,
          sourceNote: sourceNote.trim() || 'Manual savings log',
          allocations: normalized,
          createdBy,
          ...(jarId ? { jarId } : {}),
        }"
)

# 5. Update return value in logSavingsEntry setState to include jars update
$c = $c.Replace(
  "          savingsEntries: [entry, ...prev.savingsEntries],
          dailyCheckIn: nextCheckIn,
        }
      })
    },
    [],
  )",
  "          jars: jarId
            ? prev.jars.map((j) => (j.id === jarId ? { ...j, balance: j.balance + roundedAmount } : j))
            : prev.jars,
          savingsEntries: [entry, ...prev.savingsEntries],
          dailyCheckIn: nextCheckIn,
        }
      })
    },
    [],
  )"
)

# 6. Add new actions after addGoal and before applyOnboarding
$newActions = @"
  const addBill = useCallback((bill: Omit<StormWarning, 'id' | 'status'>) => {
    setState((prev) =>
      refreshConditionState(prev, [
        ...prev.storms,
        { ...bill, id: `bill-${Date.now()}`, status: 'upcoming' as const },
      ]),
    )
  }, [])

  const markBillHandled = useCallback((id: string) => {
    setState((prev) =>
      refreshConditionState(
        prev,
        prev.storms.map((storm) =>
          storm.id === id
            ? { ...storm, status: 'handled' as const, handledAt: getTodayKey(), remindAt: undefined }
            : storm,
        ),
      ),
    )
  }, [])

  const deleteBill = useCallback((id: string) => {
    setState((prev) =>
      refreshConditionState(
        prev,
        prev.storms.filter((storm) => storm.id !== id),
      ),
    )
  }, [])

  const snoozeBill = useCallback((id: string, remindAt: string) => {
    setState((prev) =>
      refreshConditionState(
        prev,
        prev.storms.map((storm) =>
          storm.id === id
            ? { ...storm, status: 'remind_later' as const, remindAt, handledAt: undefined }
            : storm,
        ),
      ),
    )
  }, [])

  const addJar = useCallback((name: string, icon: string, color: string) => {
    const newJar: SavingsJar = {
      id: `jar-${Date.now()}`,
      name: name.trim(),
      icon,
      color,
      balance: 0,
    }
    setState((prev) => ({ ...prev, jars: [...prev.jars, newJar] }))
  }, [])

  const depositToJar = useCallback((jarId: string, amount: number) => {
    const rounded = Math.max(0, Math.round(amount))
    if (rounded <= 0) return
    setState((prev) => ({
      ...prev,
      jars: prev.jars.map((j) => (j.id === jarId ? { ...j, balance: j.balance + rounded } : j)),
    }))
  }, [])

  const applyOnboarding
"@
$c = $c.Replace("  const applyOnboarding", $newActions)

# 7. Add new actions to return object
$c = $c.Replace(
  "    addGoal,
    applyOnboarding,
    resetDemo,
  }",
  "    addGoal,
    addBill,
    markBillHandled,
    deleteBill,
    snoozeBill,
    addJar,
    depositToJar,
    applyOnboarding,
    resetDemo,
  }"
)

[IO.File]::WriteAllText($path, $c)
Write-Host "useAppState.ts patched"

# ─── Verify key strings ───────────────────────────────────────────
$c2 = [IO.File]::ReadAllText($path)
Write-Host "Has SavingsJar import: $($c2.Contains('SavingsJar'))"
Write-Host "Has jars in state: $($c2.Contains('jars: ['))"
Write-Host "Has addBill: $($c2.Contains('const addBill'))"
Write-Host "Has addJar: $($c2.Contains('const addJar'))"
Write-Host "Has jarId param: $($c2.Contains('jarId?: string'))"
Write-Host "Returns addBill: $($c2.Contains('addBill,'))"
