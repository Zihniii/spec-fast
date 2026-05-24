'use client';

/**
 * Pure function that formats the progress indicator text.
 * Takes a 0-based index and returns the formatted string.
 */
export function formatProgressIndicator(index: number): string {
  return `${index + 1} of 7`;
}

interface ProgressIndicatorProps {
  /** Current question index (0-based) */
  currentIndex: number;
}

export function ProgressIndicator({ currentIndex }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Step dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < currentIndex
                ? 'w-1.5 bg-neutral-900'
                : i === currentIndex
                ? 'w-6 bg-neutral-900'
                : 'w-1.5 bg-neutral-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-500 font-medium tabular-nums">
        {formatProgressIndicator(currentIndex)}
      </span>
    </div>
  );
}
