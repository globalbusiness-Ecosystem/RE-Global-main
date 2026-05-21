'use client';

interface SkeletonLoaderProps {
  width?: number;
  height?: number;
  className?: string;
  shimmer?: boolean;
}

export const SkeletonLoader = ({
  width = 400,
  height = 300,
  className = '',
  shimmer = true,
}: SkeletonLoaderProps) => {
  return (
    <div
      className={`bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden ${className} ${
        shimmer ? 'animate-pulse' : ''
      }`}
      style={{ width, height }}
    >
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      )}
    </div>
  );
};
