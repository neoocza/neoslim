"use client";

interface CalorieRingProps {
  consumed: number;
  budget: number;
  size?: number;
}

export default function CalorieRing({
  consumed,
  budget,
  size = 160,
}: CalorieRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const remaining = Math.max(0, budget - consumed);
  const usedRatio = Math.min(consumed / budget, 1);
  const offset = circumference - usedRatio * circumference;
  const isOver = consumed > budget;

  // Green track = remaining budget (good), filled portion = consumed
  // When over budget, ring turns red
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Full ring background — represents budget available (green) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? "#fecaca" : "#d1fae5"}
          strokeWidth={strokeWidth}
        />
        {/* Consumed portion overlaid */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? "#ef4444" : "#6b7280"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity={0.3}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold tracking-tight ${isOver ? "text-danger" : "text-success"}`}>
          {isOver ? `+${consumed - budget}` : remaining}
        </span>
        <span className="text-[10px] text-muted uppercase tracking-wider font-medium">
          {isOver ? "over budget" : "kcal left"}
        </span>
        <span className="text-xs text-muted mt-0.5">
          {consumed} / {budget}
        </span>
      </div>
    </div>
  );
}
