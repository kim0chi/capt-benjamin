'use client'

import { useState } from 'react'
import { AlertTriangle, CalendarDays, CheckCircle2, CloudLightning, Plus, Trash2, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { SavingsJar, StormWarning } from '@/types'

interface BillsScreenProps {
  storms: StormWarning[]
  jars: SavingsJar[]
  onAddBill: (bill: Omit<StormWarning, 'id' | 'status'>) => void
  onMarkHandled: (id: string) => void
  onPayBill: (billId: string, jarId: string) => void
  onDeleteBill: (id: string) => void
  onSnoozeBill: (id: string, remindAt: string) => void
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', className: 'bg-coral/20 text-coral border-coral/30' },
  high: { label: 'High', className: 'bg-brass/20 text-brass border-brass/30' },
  medium: { label: 'Medium', className: 'bg-sky/20 text-sky border-sky/30' },
}

function parseDueDate(dueDate: string): Date {
  // parse YYYY-MM-DD as local date
  const [y, m, d] = dueDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function BillsScreen({ storms, jars, onAddBill, onMarkHandled, onPayBill, onDeleteBill, onSnoozeBill }: BillsScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [snoozeTarget, setSnoozeTarget] = useState<string | null>(null)
  const [snoozeDate, setSnoozeDate] = useState<Date | undefined>(undefined)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [snoozeSheetOpen, setSnoozeSheetOpen] = useState(false)
  const [payBillTarget, setPayBillTarget] = useState<StormWarning | null>(null)
  const [payBillJarId, setPayBillJarId] = useState<string>('')
  const [payBillSheetOpen, setPayBillSheetOpen] = useState(false)

  // Add-bill form state
  const [formName, setFormName] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formDueDate, setFormDueDate] = useState<Date | undefined>(undefined)
  const [formPriority, setFormPriority] = useState<'critical' | 'high' | 'medium'>('medium')

  const activeBills = storms.filter((b) => b.status !== 'handled')
  const handledBills = storms.filter((b) => b.status === 'handled')

  const billDates = activeBills.map((b) => parseDueDate(b.dueDate))

  const billsOnSelected = selectedDate
    ? activeBills.filter((b) => {
        const d = parseDueDate(b.dueDate)
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        )
      })
    : []

  function handleAddBill() {
    if (!formName.trim() || !formAmount || !formDueDate) {
      toast.error('Fill in all required fields.')
      return
    }
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount.')
      return
    }
    const dueDateStr = formDueDate.toISOString().slice(0, 10)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffMs = formDueDate.getTime() - today.getTime()
    const daysUntilDue = Math.ceil(diffMs / 86400000)

    onAddBill({
      name: formName.trim(),
      amount,
      dueDate: dueDateStr,
      daysUntilDue,
      priority: formPriority,
      icon: 'CloudLightning',
    })
    toast.success(`"${formName.trim()}" added to bills.`)
    setFormName('')
    setFormAmount('')
    setFormDueDate(undefined)
    setFormPriority('medium')
    setAddSheetOpen(false)
  }

  function handleMarkHandled(bill: StormWarning) {
    onMarkHandled(bill.id)
    toast.success(`"${bill.name}" marked as handled!`, { icon: '✅' })
  }

  function openPayBill(bill: StormWarning) {
    setPayBillTarget(bill)
    setPayBillJarId(jars[0]?.id ?? '')
    setPayBillSheetOpen(true)
  }

  function confirmPayBill() {
    if (!payBillTarget || !payBillJarId) {
      toast.error('Select a jar to pay from.')
      return
    }
    const jar = jars.find((j) => j.id === payBillJarId)
    onPayBill(payBillTarget.id, payBillJarId)
    toast.success(`"${payBillTarget.name}" paid from ${jar?.name ?? 'jar'}.`, { icon: '✅' })
    setPayBillSheetOpen(false)
    setPayBillTarget(null)
  }

  function handleDelete(id: string) {
    const bill = storms.find((b) => b.id === id)
    onDeleteBill(id)
    toast.success(`"${bill?.name}" removed.`)
    setDeleteTarget(null)
  }

  function openSnooze(bill: StormWarning) {
    setSnoozeTarget(bill.id)
    setSnoozeDate(undefined)
    setSnoozeSheetOpen(true)
  }

  function confirmSnooze() {
    if (!snoozeTarget || !snoozeDate) {
      toast.error('Pick a reminder date.')
      return
    }
    const bill = storms.find((b) => b.id === snoozeTarget)
    onSnoozeBill(snoozeTarget, snoozeDate.toISOString())
    toast('Snoozed!', {
      description: `We'll remind you about "${bill?.name}" on ${snoozeDate.toLocaleDateString()}.`,
      icon: '🔔',
    })
    setSnoozeSheetOpen(false)
    setSnoozeTarget(null)
  }

  const displayBills = selectedDate && billsOnSelected.length > 0 ? billsOnSelected : activeBills

  return (
    <div className="pirate-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="pirate-kicker">Storm Warning</p>
          <h1 className="font-display text-2xl font-bold text-bone">Bills</h1>
        </div>
        <button
          onClick={() => setAddSheetOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brass/20 px-4 py-2 text-sm font-semibold text-brass hover:bg-brass/30 border border-brass/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Bill
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Panel */}
        <div className="pirate-panel lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-bone/70">
            <CalendarDays className="h-4 w-4 text-teal" />
            <span className="text-sm font-semibold uppercase tracking-widest text-teal">Due Dates</span>
          </div>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ billDue: billDates }}
              modifiersClassNames={{
                billDue:
                  'after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-coral relative',
              }}
              className="text-bone [--rdp-accent-color:theme(colors.brass.DEFAULT,#c6a15b)] [--rdp-background-color:theme(colors.wood.DEFAULT,#3a2e20)]"
            />
          </div>
          {selectedDate && (
            <p className="mt-2 text-center text-xs text-sand/50">
              {billsOnSelected.length > 0
                ? `${billsOnSelected.length} bill(s) due on ${selectedDate.toLocaleDateString()}`
                : `No bills due on ${selectedDate.toLocaleDateString()}`}
              {' · '}
              <button className="text-teal hover:underline" onClick={() => setSelectedDate(undefined)}>
                Clear
              </button>
            </p>
          )}
        </div>

        {/* Bill List */}
        <div className="space-y-3 lg:col-span-1">
          <div className="mb-1 flex items-center gap-2">
            <CloudLightning className="h-4 w-4 text-brass" />
            <span className="text-sm font-semibold uppercase tracking-widest text-brass">
              {selectedDate && billsOnSelected.length > 0 ? 'On selected date' : 'Upcoming'}
            </span>
            <span className="ml-auto rounded-full bg-coral/20 px-2 py-0.5 text-xs font-bold text-coral">
              {activeBills.length}
            </span>
          </div>

          {displayBills.length === 0 && (
            <div className="pirate-panel text-center py-8">
              <CheckCircle2 className="mx-auto h-8 w-8 text-teal mb-2" />
              <p className="text-bone/60 text-sm">All clear, Captain!</p>
            </div>
          )}

          {displayBills.map((bill) => {
            const priority = PRIORITY_CONFIG[bill.priority]
            const isOverdue = bill.daysUntilDue < 0
            const isSoon = bill.daysUntilDue >= 0 && bill.daysUntilDue <= 2

            return (
              <div key={bill.id} className="pirate-panel group relative">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wood/40 border border-brass/20">
                    <CloudLightning className="h-5 w-5 text-brass" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-bone truncate">{bill.name}</span>
                      <Badge className={`text-[10px] px-2 py-0 border ${priority.className}`}>
                        {priority.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-lg font-bold text-brass">₱{bill.amount.toLocaleString()}</p>
                    <p className={`text-xs ${isOverdue ? 'text-coral' : isSoon ? 'text-brass' : 'text-sand/60'}`}>
                      {isOverdue
                        ? `Overdue by ${Math.abs(bill.daysUntilDue)} day(s)`
                        : bill.daysUntilDue === 0
                        ? 'Due today'
                        : `Due in ${bill.daysUntilDue} day(s) · ${parseDueDate(bill.dueDate).toLocaleDateString()}`}
                    </p>
                    {bill.status === 'remind_later' && bill.remindAt && (
                      <p className="text-xs text-sky/70 mt-0.5">
                        Snoozed until {new Date(bill.remindAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => jars.length > 0 ? openPayBill(bill) : handleMarkHandled(bill)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal/15 px-3 py-1.5 text-xs font-semibold text-teal hover:bg-teal/25 border border-teal/20 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {jars.length > 0 ? 'Pay Bill' : 'Handled'}
                  </button>
                  <button
                    onClick={() => openSnooze(bill)}
                    className="flex items-center gap-1.5 rounded-lg bg-sky/10 px-3 py-1.5 text-xs font-semibold text-sky hover:bg-sky/20 border border-sky/20 transition-colors"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    Snooze
                  </button>
                  <button
                    onClick={() => setDeleteTarget(bill.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral hover:bg-coral/20 border border-coral/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Handled section */}
          {handledBills.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-sand/40 hover:text-sand/70 select-none">
                Handled ({handledBills.length})
              </summary>
              <div className="mt-2 space-y-2">
                {handledBills.map((bill) => (
                  <div key={bill.id} className="pirate-panel opacity-50 flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                    <span className="flex-1 text-sm text-bone/60 line-through">{bill.name}</span>
                    <span className="text-sm text-sand/50">₱{bill.amount.toLocaleString()}</span>
                    <button
                      onClick={() => setDeleteTarget(bill.id)}
                      className="ml-1 text-coral/50 hover:text-coral transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* Add Bill Sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent side="bottom" className="bg-ink border-brass/20 text-bone rounded-t-2xl max-h-[90dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-bone font-display">Add a Bill</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-8">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                Bill Name
              </label>
              <input
                className="w-full rounded-xl border border-brass/20 bg-wood/20 px-4 py-2.5 text-bone placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-brass/40"
                placeholder="e.g. Electric Bill"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                Amount (₱)
              </label>
              <input
                className="w-full rounded-xl border border-brass/20 bg-wood/20 px-4 py-2.5 text-bone placeholder:text-sand/30 focus:outline-none focus:ring-2 focus:ring-brass/40"
                placeholder="0.00"
                type="number"
                min="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                Due Date
              </label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={formDueDate}
                  onSelect={setFormDueDate}
                  className="text-bone"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-sand/60">
                Priority
              </label>
              <div className="flex gap-2">
                {(['critical', 'high', 'medium'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFormPriority(p)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                      formPriority === p
                        ? PRIORITY_CONFIG[p].className + ' ring-2 ring-offset-1 ring-offset-ink'
                        : 'border-brass/10 bg-wood/10 text-sand/50 hover:bg-wood/20'
                    }`}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddBill}
              className="mt-2 w-full rounded-xl bg-brass px-4 py-3 font-bold text-ink hover:bg-brass/90 transition-colors"
            >
              Add Bill
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Snooze Sheet */}
      <Sheet open={snoozeSheetOpen} onOpenChange={setSnoozeSheetOpen}>
        <SheetContent side="bottom" className="bg-ink border-brass/20 text-bone rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-bone font-display flex items-center gap-2">
              <Bell className="h-4 w-4 text-sky" /> Snooze Bill
            </SheetTitle>
          </SheetHeader>
          <p className="mb-4 text-sm text-sand/60">Pick a date to be reminded again.</p>
          <div className="flex justify-center mb-4">
            <Calendar mode="single" selected={snoozeDate} onSelect={setSnoozeDate} className="text-bone" />
          </div>
          <div className="flex gap-3 pb-8">
            <button
              onClick={() => setSnoozeSheetOpen(false)}
              className="flex-1 rounded-xl border border-brass/20 px-4 py-2.5 text-sm font-semibold text-sand/70 hover:bg-wood/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmSnooze}
              className="flex-1 rounded-xl bg-sky/20 px-4 py-2.5 text-sm font-bold text-sky border border-sky/30 hover:bg-sky/30 transition-colors"
            >
              Confirm Snooze
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Pay Bill Sheet */}
      <Sheet open={payBillSheetOpen} onOpenChange={setPayBillSheetOpen}>
        <SheetContent side="bottom" className="bg-ink border-brass/20 text-bone rounded-t-2xl max-h-[90dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-bone font-display flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              Pay Bill
            </SheetTitle>
          </SheetHeader>
          {payBillTarget && (
            <div className="space-y-4 pb-8">
              <div className="rounded-xl border border-brass/16 bg-wood/10 px-4 py-3">
                <p className="text-xs text-sand/50 uppercase tracking-widest font-semibold">Bill</p>
                <p className="mt-1 text-base font-semibold text-bone">{payBillTarget.name}</p>
                <p className="text-xl font-bold text-brass">₱{payBillTarget.amount.toLocaleString()}</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sand/60">
                  Pay from which jar?
                </p>
                {jars.length === 0 ? (
                  <p className="text-sm text-sand/50 py-2">No jars set up yet.</p>
                ) : (
                  <div className="space-y-2">
                    {jars.map((jar) => {
                      const insufficient = jar.balance < payBillTarget.amount
                      return (
                        <button
                          key={jar.id}
                          onClick={() => setPayBillJarId(jar.id)}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                            payBillJarId === jar.id
                              ? 'border-teal bg-teal/10'
                              : 'border-brass/16 bg-wood/10 hover:bg-wood/20'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-bone">{jar.name}</p>
                            {insufficient && (
                              <p className="text-xs text-coral/80 mt-0.5">Low balance — will go negative</p>
                            )}
                          </div>
                          <p className={`text-sm font-bold ${insufficient ? 'text-coral/70' : 'text-brass'}`}>
                            ₱{jar.balance.toLocaleString()}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPayBillSheetOpen(false)}
                  className="flex-1 rounded-xl border border-brass/20 px-4 py-2.5 text-sm font-semibold text-sand/70 hover:bg-wood/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayBill}
                  disabled={!payBillJarId}
                  className="flex-1 rounded-xl bg-teal/20 px-4 py-2.5 text-sm font-bold text-teal border border-teal/30 hover:bg-teal/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-ink border-brass/20 text-bone">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-coral" />
              Delete Bill?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sand/60">
              This bill will be permanently removed from your log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-brass/20 text-sand/70 hover:bg-wood/20 bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-coral/80 text-bone hover:bg-coral"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
