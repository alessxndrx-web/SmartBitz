export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="loading-skeleton" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="loading-line" />
      ))}
    </div>
  );
}
