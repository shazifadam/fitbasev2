import { Skeleton } from '@/components/ui/skeleton'

export default function ClientDetailLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">
        {/* Back */}
        <Skeleton className="h-4 w-28" />

        {/* Name + menu */}
        <div className="flex items-center justify-between -mt-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-6" />
        </div>

        {/* Programs */}
        <Skeleton className="h-4 w-36 -mt-3" />

        {/* Meta row */}
        <div className="flex items-center gap-3 -mt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Progress stats */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
          </div>
        </div>

        {/* Attendance grid */}
        <Skeleton className="h-36 w-full" />

        {/* Payment card */}
        <Skeleton className="h-32 w-full" />
      </div>
    </main>
  )
}
