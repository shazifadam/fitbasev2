import { Skeleton } from '@/components/ui/skeleton'

export default function ProgressLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-12 pb-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-44 -mt-2" />

        {/* Filter tabs */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>

        {/* Chart */}
        <Skeleton className="h-48 w-full" />

        {/* Measurement log */}
        <Skeleton className="h-5 w-40" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </main>
  )
}
