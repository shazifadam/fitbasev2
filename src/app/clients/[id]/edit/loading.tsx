import { Skeleton } from '@/components/ui/skeleton'

export default function EditClientLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-8">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Form card */}
        <div className="flex flex-col gap-5 rounded-base bg-white border border-neutral-200 p-6">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-14" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>

        <Skeleton className="h-12 w-full" />
      </div>
    </main>
  )
}
