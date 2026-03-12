import { Skeleton } from '@/components/ui/skeleton'

export default function ExercisesLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-40" />
        </div>

        {/* Search */}
        <Skeleton className="h-11 w-full" />

        {/* Filter chips */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Exercise count */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Exercise list */}
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </main>
  )
}
