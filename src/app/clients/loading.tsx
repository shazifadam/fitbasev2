import { Skeleton } from '@/components/ui/skeleton'

export default function ClientsLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-44" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>

        {/* Search */}
        <Skeleton className="h-11 w-full" />

        {/* Filter tabs */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-14" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>

        {/* List header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Client cards */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full" />
          ))}
        </div>
      </div>
    </main>
  )
}
