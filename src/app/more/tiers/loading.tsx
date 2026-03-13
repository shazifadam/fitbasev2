import { Skeleton } from '@/components/ui/skeleton'

export default function TiersLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-12 pb-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-44 -mt-2" />

        <div className="flex items-center justify-between -mt-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-[72px] w-full" />
          <Skeleton className="h-[72px] w-full" />
          <Skeleton className="h-[72px] w-full" />
        </div>

        <Skeleton className="h-[52px] w-full" />
      </div>
    </main>
  )
}
