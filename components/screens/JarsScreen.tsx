'use client'

import { useState } from 'react'
import { Anchor, ArrowDownLeft, ArrowUpRight, Coins, Plus, PiggyBank, Scroll, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { SavingsEntry, SavingsJar } from '@/types'

interface JarsScreenProps {
  jars: SavingsJar[]
  savingsEntries: SavingsEntry[]
  onAddJar: (name: string, icon: string, color: string) => void
  onDepositToJar: (jarId: string, amount: number) => void
  onWithdrawFromJar: (jarId: string, amount: number, sourceNote: string) => void
}

const JAR_ICONS: Array<{ id: string; Icon: React.ElementType }> = [
  { id: 'PiggyBank', Icon: PiggyBank },
  { id: 'Anchor', Icon: Anchor },
  { id: 'Coins', Icon: Coins },
  { id: 'Scroll', Icon: Scroll },
  { id: 'TrendingUp', Icon: TrendingUp },
]

const JAR_ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  JAR_ICONS.map(({ id, Icon }) => [id, Icon]),
)

const JAR_COLORS = [
  { id: 'from-brass to-sand', label: 'Gold' },
  { id: 'from-teal to-sky', label: 'Ocean' },
  { id: 'from-sky to-teal', label: 'Sky' },
  { id: 'from-coral to-oxblood', label: 'Coral' },
  { id: 'from-wood to-ink', label: 'Wood' },
]

function JarIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = JAR_ICON_MAP[icon] ?? PiggyBank
  return <Icon className={className} />
}

export function JarsScreen({ jars, savingsEntries, onAddJar, onDepositToJar, onWithdrawFromJar }: JarsScreenProps) {
  const [selectedJar, setSelectedJar] = useState<SavingsJar | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState<Record<string, string>>({})

  // Withdraw sheet state
  const [withdrawJar, setWithdrawJar] = useState<SavingsJar | null>(null)
  const [withdrawSheetOpen, setWithdrawSheetOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawNote, setWithdrawNote] = useState('')

  // Add jar form
  const [formName, setFormName] = useState('')
  const [formIcon, setFormIcon] = useState('PiggyBank')
  const [formColor, setFormColor] = useState('from-teal to-sky')

  const totalBalance = jars.reduce((sum, jar) => sum + jar.balance, 0)

  function handleDeposit(jar: SavingsJar) {
    const raw = depositAmount[jar.id] ?? ''
    const amount = parseFloat(raw)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid deposit amount.')
      return
    }
    onDepositToJar(jar.id, amount)
    toast.success(`₱${amount.toLocaleString()} deposited into "${jar.name}".`, { icon: '🪙' })
    setDepositAmount((prev) => ({ ...prev, [jar.id]: '' }))
  }

  function openWithdraw(jar: SavingsJar) {
    setWithdrawJar(jar)
    setWithdrawAmount('')
    setWithdrawNote('')
    setWithdrawSheetOpen(true)
  }

  function handleWithdraw() {
    if (!withdrawJar) return
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount to withdraw.')
      return
    }
    onWithdrawFromJar(withdrawJar.id, amount, withdrawNote.trim() || 'Withdrawal')
    toast.success(`₱${amount.toLocaleString()} taken out of "${withdrawJar.name}".`, { icon: '📤' })
    setWithdrawSheetOpen(false)
    setWithdrawJar(null)
  }

  function handleAddJar() {
    if (!formName.trim()) {
      toast.error('Give your jar a name.')
      return
    }
    onAddJar(formName.trim(), formIcon, formColor)
    toast.success(`"${formName.trim()}" jar created!`, { icon: '🫙' })
    setFormName('')
    setFormIcon('PiggyBank')
    setFormColor('from-teal to-sky')
    setAddSheetOpen(false)
  }

  function openJarHistory(jar: SavingsJar) {
    setSelectedJar(jar)
    setDrawerOpen(true)
  }

  const jarEntries = selectedJar
    ? savingsEntries.filter((e) => e.jarId === selectedJar.id)
    : []

  return (
    <div className="pirate-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="pirate-kicker">Savings</p>
          <h1 className="font-display text-2xl font-bold text-bone">Jars</h1>
        </div>
        <button
          onClick={() => setAddSheetOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal/20 px-4 py-2 text-sm font-semibold text-teal hover:bg-teal/30 border border-teal/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Jar
        </button>
      </div>

      {/* Total balance */}
      <div className="pirate-panel mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal to-sky shadow-lg">
          <PiggyBank className="h-6 w-6 text-ink" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sand/50">Total Across All Jars</p>
          <p className="text-2xl font-bold text-bone">₱{totalBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Jar grid */}
      {jars.length === 0 && (
        <div className="pirate-panel text-center py-12">
          <PiggyBank className="mx-auto h-10 w-10 text-sand/30 mb-3" />
          <p className="text-bone/50">No jars yet. Create one to start tracking savings.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jars.map((jar) => {
          const entryCount = savingsEntries.filter((e) => e.jarId === jar.id).length

          return (
            <div key={jar.id} className="pirate-panel group flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${jar.color} shadow-lg`}
                >
                  <JarIcon icon={jar.icon} className="h-6 w-6 text-ink" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-bone">{jar.name}</h3>
                  <p className="text-xs text-sand/50">{entryCount} transaction{entryCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <p className="text-2xl font-bold text-brass">₱{jar.balance.toLocaleString()}</p>

              {/* Deposit input */}
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="₱ deposit"
                  value={depositAmount[jar.id] ?? ''}
                  onChange={(e) => setDepositAmount((prev) => ({ ...prev, [jar.id]: e.target.value }))}
                  className="flex-1 rounded-xl border border-brass/20 bg-wood/20 px-3 py-2 text-sm text-bone placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-brass/40"
                  onKeyDown={(e) => e.key === 'Enter' && handleDeposit(jar)}
                />
                <button
                  onClick={() => handleDeposit(jar)}
                  className="rounded-xl bg-brass/20 px-3 py-2 text-sm font-semibold text-brass hover:bg-brass/30 border border-brass/30 transition-colors"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openWithdraw(jar)}
                  className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral hover:bg-coral/20 border border-coral/20 transition-colors"
                  title="Take out / Spend"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => openJarHistory(jar)}
                className="text-xs text-teal/70 hover:text-teal underline underline-offset-2 text-left transition-colors"
              >
                View history →
              </button>
            </div>
          )
        })}
      </div>

      {/* Jar history drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-ink border-brass/20 text-bone max-h-[80dvh]">
          <DrawerHeader>
            <DrawerTitle className="font-display flex items-center gap-3 text-bone">
              {selectedJar && (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${selectedJar.color}`}
                >
                  <JarIcon icon={selectedJar.icon} className="h-4 w-4 text-ink" />
                </div>
              )}
              {selectedJar?.name} — History
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">
            {jarEntries.length === 0 ? (
              <p className="py-8 text-center text-sm text-sand/50">No entries for this jar yet.</p>
            ) : (
              <div className="space-y-2">
                {jarEntries.map((entry) => {
                  const isWithdrawal = entry.type === 'withdrawal'
                  return (
                    <div key={entry.id} className="pirate-panel flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isWithdrawal ? 'bg-coral/15' : 'bg-teal/20'}`}>
                        {isWithdrawal
                          ? <ArrowDownLeft className="h-4 w-4 text-coral" />
                          : <ArrowUpRight className="h-4 w-4 text-teal" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-bone">{entry.sourceNote}</p>
                        <p className="text-xs text-sand/50">{entry.date}</p>
                      </div>
                      <p className={`text-sm font-bold ${isWithdrawal ? 'text-coral' : 'text-brass'}`}>
                        {isWithdrawal ? '-' : '+'}₱{entry.amount.toLocaleString()}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Withdraw Sheet */}
      <Sheet open={withdrawSheetOpen} onOpenChange={setWithdrawSheetOpen}>
        <SheetContent side="bottom" className="bg-ink border-brass/20 text-bone rounded-t-2xl max-h-[90dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-bone font-display flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-coral" />
              Take Out / Spend
            </SheetTitle>
          </SheetHeader>
          {withdrawJar && (
            <div className="space-y-4 pb-8">
              <div className="rounded-xl border border-brass/16 bg-wood/10 px-4 py-3">
                <p className="text-xs text-sand/50 uppercase tracking-widest font-semibold">From jar</p>
                <p className="mt-1 text-base font-semibold text-bone">{withdrawJar.name}</p>
                <p className="text-lg font-bold text-brass">₱{withdrawJar.balance.toLocaleString()} available</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-xl border border-brass/20 bg-wood/20 px-4 py-2.5 text-bone placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-coral/40"
                  autoFocus
                />
                {withdrawJar.balance < parseFloat(withdrawAmount || '0') && (
                  <p className="mt-1 text-xs text-coral/80">This exceeds the jar balance — it will go negative.</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid electric bill"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  className="w-full rounded-xl border border-brass/20 bg-wood/20 px-4 py-2.5 text-bone placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-brass/40"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setWithdrawSheetOpen(false)}
                  className="flex-1 rounded-xl border border-brass/20 px-4 py-2.5 text-sm font-semibold text-sand/70 hover:bg-wood/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="flex-1 rounded-xl bg-coral/20 px-4 py-2.5 text-sm font-bold text-coral border border-coral/30 hover:bg-coral/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Jar Sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent side="bottom" className="bg-ink border-brass/20 text-bone rounded-t-2xl max-h-[90dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-bone font-display">New Savings Jar</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-8">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                Jar Name
              </label>
              <input
                className="w-full rounded-xl border border-brass/20 bg-wood/20 px-4 py-2.5 text-bone placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-brass/40"
                placeholder="e.g. Emergency Fund"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                Icon
              </label>
              <div className="flex gap-2 flex-wrap">
                {JAR_ICONS.map(({ id, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setFormIcon(id)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                      formIcon === id
                        ? 'border-teal bg-teal/20 text-teal'
                        : 'border-brass/20 bg-wood/20 text-sand/50 hover:bg-wood/30'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {JAR_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFormColor(c.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-colors ${
                      formColor === c.id
                        ? 'border-teal bg-teal/20 text-teal'
                        : 'border-brass/20 bg-wood/20 text-sand/50 hover:bg-wood/30'
                    }`}
                  >
                    <span className={`mr-1.5 inline-block h-2 w-2 rounded-full bg-gradient-to-r ${c.id}`} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 rounded-xl border border-brass/10 bg-wood/10 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${formColor} shadow-lg`}>
                <JarIcon icon={formIcon} className="h-6 w-6 text-ink" />
              </div>
              <div>
                <p className="font-semibold text-bone">{formName || 'Jar Name'}</p>
                <p className="text-xs text-sand/50">₱0 · 0 transactions</p>
              </div>
            </div>

            <button
              onClick={handleAddJar}
              className="mt-2 w-full rounded-xl bg-teal px-4 py-3 font-bold text-ink hover:bg-teal/90 transition-colors"
            >
              Create Jar
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
