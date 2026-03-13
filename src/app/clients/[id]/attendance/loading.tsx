import { Skeleton } from '@/components/ui/skeleton'

export default function AttendanceLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-52 -mt-2" />

        {/* Calendar grid placeholder */}
        <Skeleton className="h-64 w-full" />

        {/* Legend */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </main>
  )
}
