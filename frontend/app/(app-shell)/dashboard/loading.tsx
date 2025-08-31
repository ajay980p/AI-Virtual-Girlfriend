export default function Loading() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <section className="md:col-span-2">
        <div className="rounded-2xl border bg-card p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="animate-pulse">
              <div className="h-5 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <aside className="space-y-6">
        <div className="rounded-2xl border bg-card p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="h-3 bg-muted rounded w-32"></div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-16 mb-2"></div>
            <div className="h-3 bg-muted rounded w-40 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-16"></div>
              <div className="h-6 bg-muted rounded w-18"></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}