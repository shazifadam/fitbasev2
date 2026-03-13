import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-32 -mt-2" />

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Display name */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-3 w-56" />
        </div>

        <Skeleton className="h-[52px] w-full" />
      </div>
    </main>
  )
}
