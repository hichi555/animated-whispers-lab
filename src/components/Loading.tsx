export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-secondary rounded-lg animate-shimmer" />
      ))}
    </div>
  );
}

export function LoadingPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-secondary rounded-lg animate-shimmer" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-secondary rounded-xl animate-shimmer" />
        ))}
      </div>
    </div>
  );
}
