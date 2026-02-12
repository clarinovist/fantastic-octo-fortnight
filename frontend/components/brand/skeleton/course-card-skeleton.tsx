export function CourseCardSkeleton() {
  return (
    <div className="animate-pulse w-[338.25px]">
      <div className="bg-gray-200 rounded-lg aspect-video mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  )
}
