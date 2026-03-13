import { Skeleton } from '@/components/ui/skeleton'

export default function RecordProgressFormLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-44 -mt-2" />

        {/* Client info card */}
        <Skeleton className="h-16 w-full" />

        {/* Previous measurement */}
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-16 w-full" />

        {/* Date */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Measurements */}
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        <Skeleton className="h-[52px] w-full" />
      </div>
    </main>
  )
}
