'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  MinusSignIcon,
} from 'hugeicons-react'
import type { ProgressHistoryData, ProgressRow } from '@/actions/progress'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MetricTab = 'weight' | 'fat_percent' | 'height'

const TAB_LABELS: Record<MetricTab, string> = {
  weight: 'Weight',
  fat_percent: 'Body Fat',
  height: 'Height',
}

const TAB_UNITS: Record<MetricTab, string> = {
  weight: 'kg',
  fat_percent: '%',
  height: 'cm',
}

function formatDate(dateStr: string): string {
  const d = dateStr.split('T')[0]
  const [y, m, day] = d.split('-').map(Number)
  const date = new Date(y, m - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMonthShort(dateStr: string): string {
  const d = dateStr.split('T')[0]
  const [y, m] = d.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}

function getValue(entry: ProgressRow, metric: MetricTab): number | null {
  return entry[metric] != null ? Number(entry[metric]) : null
}

// ─── Simple SVG Line Chart ──────────────────────────────────────────────────

function ProgressChart({
  entries,
  metric,
}: {
  entries: ProgressRow[]
  metric: MetricTab
}) {
  // Filter entries that have a value for this metric, sorted oldest first
  const dataPoints = entries
    .filter(e => getValue(e, metric) != null)
    .reverse()
    .map(e => ({
      value: Number(getValue(e, metric)),
      date: e.recorded_at,
    }))

  if (dataPoints.length < 2) {
    return (
      <div className="flex items-center justify-center h-[200px] rounded-base bg-white border border-neutral-200">
        <span className="text-[14px] font-normal text-neutral-400">
          Need at least 2 entries to show chart
        </span>
      </div>
    )
  }

  const values = dataPoints.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padding = range * 0.1

  const chartW = 320
  const chartH = 180
  const padX = 40
  const padY = 16
  const drawW = chartW - padX
  const drawH = chartH - padY * 2

  const yMin = min - padding
  const yMax = max + padding
  const yRange = yMax - yMin

  const points = dataPoints.map((d, i) => ({
    x: padX + (i / (dataPoints.length - 1)) * drawW,
    y: padY + drawH - ((d.value - yMin) / yRange) * drawH,
    value: d.value,
    date: d.date,
  }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  // Y-axis labels
  const ySteps = 5
  const yLabels = Array.from({ length: ySteps + 1 }).map((_, i) => {
    const val = yMin + (i / ySteps) * yRange
    return { y: padY + drawH - (i / ySteps) * drawH, label: val.toFixed(1) }
  })

  // X-axis labels (month abbreviations)
  const xLabels = points.filter((_, i) => {
    if (dataPoints.length <= 7) return true
    return i % Math.ceil(dataPoints.length / 7) === 0 || i === dataPoints.length - 1
  })

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartW} ${chartH + 24}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yLabels.map((yl, i) => (
          <g key={i}>
            <line
              x1={padX}
              y1={yl.y}
              x2={chartW}
              y2={yl.y}
              stroke="#e5e5e5"
              strokeWidth="1"
            />
            <text
              x={padX - 6}
              y={yl.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#a3a3a3"
              fontFamily="Inter"
            >
              {parseFloat(yl.label).toFixed(0)}
            </text>
          </g>
        ))}

        {/* Trend line */}
        <path d={pathD} fill="none" stroke="#16a34a" strokeWidth="2" />

        {/* Data dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#16a34a" />
        ))}

        {/* X-axis month labels */}
        {xLabels.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={chartH + 16}
            textAnchor="middle"
            fontSize="10"
            fill="#a3a3a3"
            fontFamily="Inter"
          >
            {formatMonthShort(p.date)}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ─── Trend Icon ─────────────────────────────────────────────────────────────

function TrendIcon({ current, previous, metric }: { current: number; previous: number | null; metric: MetricTab }) {
  if (previous == null) {
    return <MinusSignIcon size={16} color="currentColor" className="text-neutral-400" />
  }
  const diff = current - previous
  // For weight and body fat, decrease is good. For height, increase is neutral.
  if (Math.abs(diff) < 0.01) {
    return <MinusSignIcon size={16} color="currentColor" className="text-neutral-400" />
  }
  if (diff < 0) {
    return <ArrowDown01Icon size={16} color="currentColor" className="text-success-600" />
  }
  return <ArrowUp01Icon size={16} color="currentColor" className={metric === 'height' ? 'text-success-600' : 'text-danger-600'} />
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  data: ProgressHistoryData
}

export function ProgressHistoryView({ data }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<MetricTab>('weight')

  const entries = data.entries
  const unit = TAB_UNITS[activeTab]

  // Build log entries with previous value for trend
  const logEntries = entries
    .filter(e => getValue(e, activeTab) != null)
    .map((e, i, arr) => ({
      ...e,
      displayValue: Number(getValue(e, activeTab)),
      previousValue: i < arr.length - 1 ? Number(getValue(arr[i + 1], activeTab)) : null,
    }))

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 h-12 px-5 pt-14">
        <button onClick={() => router.back()}>
          <ArrowLeft01Icon size={24} color="currentColor" className="text-neutral-950" />
        </button>
        <span className="text-[18px] font-medium text-neutral-950">Progress History</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 px-5 pt-4">
        {(Object.keys(TAB_LABELS) as MetricTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-9 rounded-base px-4 text-[14px] font-normal ${
              activeTab === tab
                ? 'bg-neutral-800 text-white'
                : 'bg-neutral-200 text-neutral-950'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-5 pt-4">
        <ProgressChart entries={entries} metric={activeTab} />
      </div>

      {/* Measurements Log */}
      <div className="flex flex-col gap-3 px-5 pt-6">
        <span className="text-[16px] font-medium text-neutral-950">Measurements Log</span>

        {logEntries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] font-normal text-neutral-400">
              No {TAB_LABELS[activeTab].toLowerCase()} records yet
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {logEntries.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4"
              >
                <span className="text-[14px] font-normal text-neutral-500">
                  {formatDate(entry.recorded_at)}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-medium text-neutral-950">
                    {entry.displayValue.toFixed(1)} {unit}
                  </span>
                  <TrendIcon
                    current={entry.displayValue}
                    previous={entry.previousValue}
                    metric={activeTab}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
