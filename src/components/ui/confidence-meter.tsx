import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ConfidenceMeter({ value, className, showLabel = true }: ConfidenceMeterProps) {
  const getColor = (val: number) => {
    if (val >= 80) return "bg-status-halal";
    if (val >= 60) return "bg-status-questionable";
    if (val >= 40) return "bg-status-unknown";
    return "bg-status-not-halal";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-medium">{value}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
