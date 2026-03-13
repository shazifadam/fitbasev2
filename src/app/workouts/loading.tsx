import { Skeleton } from '@/components/ui/skeleton'

export default function WorkoutsLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-48 -mt-2" />
        <Skeleton className="h-11 w-full" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </main>
  )
}
