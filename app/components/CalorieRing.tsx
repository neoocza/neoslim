"use client";

interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
}

export default function CalorieRing({
  consumed,
  target,
  size = 160,
}: CalorieRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / target, 1.25);
  const offset = circumference - progress * circumference;
  const isOver = consumed > target;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? "#ef4444" : "#0d9488"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight">{consumed}</span>
        <span className="text-xs text-muted">/ {target} kcal</span>
      </div>
    </div>
  );
}
