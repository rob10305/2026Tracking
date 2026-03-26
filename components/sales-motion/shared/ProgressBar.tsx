interface ProgressBarProps {
  percent: number;
  color?: string;
}

export function ProgressBar({ percent, color = '#3b82f6' }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: color }}
      />
    </div>
  );
}
