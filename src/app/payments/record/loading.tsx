import { Skeleton } from '@/components/ui/skeleton'

export default function RecordPaymentLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-44 -mt-2" />
        <Skeleton className="h-4 w-56 -mt-3" />

        {/* Search */}
        <Skeleton className="h-11 w-full" />

        {/* Client list */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full" />
          ))}
        </div>
      </div>
    </main>
  )
}
