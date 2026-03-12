import { Skeleton } from '@/components/ui/skeleton'

export default function PaymentsLoading() {
  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-44 -mt-2" />

        {/* Payment cards */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </main>
  )
}
