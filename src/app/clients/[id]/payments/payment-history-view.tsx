'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft01Icon, Add01Icon } from 'hugeicons-react'
import { RecordPaymentDrawer } from '@/components/payments/record-payment-drawer'
import type { PaymentHistoryData } from '@/actions/payments'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMonthYear(dateStr: string): string {
  const [y, m] = dateStr.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(validUntil: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return validUntil < today
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  data: PaymentHistoryData
}

export function PaymentHistoryView({ data }: Props) {
  const router = useRouter()
  const [showRecordDrawer, setShowRecordDrawer] = useState(false)

  const { client, payments, summary } = data

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 self-start">
          <ArrowLeft01Icon size={18} color="currentColor" className="text-neutral-500" />
          <span className="text-[13px] font-normal text-neutral-500">Back</span>
        </button>

        <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px] -mt-2">
          Payment History
        </h1>

        {/* Client Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white text-[13px] font-medium">
            {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-medium text-neutral-950">{client.name}</span>
            <span className="text-[13px] font-normal text-neutral-500">
              {client.tier_name ?? 'No tier'}{client.tier_amount ? ` · ${summary.currency} ${client.tier_amount.toFixed(2)}/mo` : ''}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base border border-neutral-200 bg-white py-3">
            <span className="text-[15px] font-medium text-neutral-950">
              {summary.currency} {summary.totalPaid.toFixed(0)}
            </span>
            <span className="text-[12px] font-normal text-neutral-500">Total Paid</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base border border-neutral-200 bg-white py-3">
            <span className={`text-[15px] font-medium ${summary.pending > 0 ? 'text-warning-700' : 'text-neutral-950'}`}>
              {summary.currency} {summary.pending.toFixed(0)}
            </span>
            <span className="text-[12px] font-normal text-neutral-500">Pending</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base border border-neutral-200 bg-white py-3">
            <span className="text-[15px] font-medium text-neutral-950">{summary.monthCount}</span>
            <span className="text-[12px] font-normal text-neutral-500">Months</span>
          </div>
        </div>

        {/* Transactions Header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">
            Transactions
          </span>
          <span className="text-[13px] font-normal text-neutral-500">
            {payments.length} payments
          </span>
        </div>

        {/* Payment List */}
        {payments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] font-normal text-neutral-400">No payment records yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {payments.map(payment => {
              const overdue = isOverdue(payment.valid_until)
              return (
                <div
                  key={payment.id}
                  className={`flex items-center justify-between rounded-base bg-white p-4 ${
                    overdue
                      ? 'border-2 border-warning-500'
                      : 'border border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-medium text-neutral-950">
                      {formatMonthYear(payment.payment_date)}
                    </span>
                    <span className={`text-[12px] font-normal ${overdue ? 'text-warning-700' : 'text-neutral-500'}`}>
                      {overdue
                        ? `Due ${formatFullDate(payment.valid_until)}`
                        : `Paid on ${formatFullDate(payment.payment_date)}`
                      }
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[15px] font-medium text-neutral-950">
                      {payment.currency} {Number(payment.amount).toFixed(2)}
                    </span>
                    <span className={`text-[12px] font-normal ${overdue ? 'text-warning-700' : 'text-success-600'}`}>
                      {overdue ? 'Pending' : 'Paid'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Record Payment Button */}
        <button
          onClick={() => setShowRecordDrawer(true)}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white"
        >
          <Add01Icon size={18} color="currentColor" />
          Record Payment
        </button>
      </div>

      <RecordPaymentDrawer
        open={showRecordDrawer}
        onClose={() => setShowRecordDrawer(false)}
        clientId={client.id}

        tierAmount={client.tier_amount}
        currency={summary.currency}
      />
    </main>
  )
}
