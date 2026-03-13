import { Skeleton } from '@/components/ui/skeleton'

export default function StatsLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-4 px-4 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-28" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Month Selector */}
        <Skeleton className="h-12 w-full rounded-card" />

        {/* Total Income Card */}
        <Skeleton className="h-24 w-full rounded-card" />

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 w-full rounded-card" />
          <Skeleton className="h-24 w-full rounded-card" />
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
        </div>

        {/* Sessions Chart */}
        <Skeleton className="h-48 w-full rounded-card" />
      </div>
    </main>
  )
}
