// Netflix-style business card skeleton loader
export default function BusinessCardSkeleton() {
  return (
    <div className="w-full bg-gray-900 rounded-lg overflow-hidden animate-pulse">
      {/* Netflix-style image skeleton with 16:9 aspect ratio */}
      <div className="relative aspect-[16/9] bg-gray-800">
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer"></div>
      </div>

      {/* Netflix-style content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
        {/* Business name skeleton */}
        <div className="h-4 bg-gray-700 rounded-md w-3/4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent animate-shimmer"></div>
        </div>
        
        {/* Category and review skeleton */}
        <div className="flex justify-between">
          <div className="h-3 bg-gray-700 rounded-md w-1/2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-3 bg-gray-700 rounded-md w-1/4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section skeleton for loading entire rows
export function BusinessSectionSkeleton({ title, count = 6 }) {
  return (
    <div className="space-y-6">
      {/* Section header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-800 rounded-md w-48 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer"></div>
        </div>
        <div className="h-4 bg-gray-800 rounded-md w-16 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <BusinessCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
