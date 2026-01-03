import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceMeter({ 
  value, 
  className, 
  showLabel = true,
  size = 'md'
}: ConfidenceMeterProps) {
  const getColor = (val: number) => {
    if (val >= 80) return "bg-status-halal";
    if (val >= 60) return "bg-status-questionable";
    if (val >= 40) return "bg-status-unknown";
    return "bg-status-not-halal";
  };

  const sizeClasses = {
    sm: { bar: 'h-1.5', text: 'text-xs', width: 'w-24' },
    md: { bar: 'h-2', text: 'text-sm', width: 'w-32' },
    lg: { bar: 'h-3', text: 'text-base', width: 'w-40' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn("space-y-2", sizes.width, className)}>
      {showLabel && (
        <div className={cn("flex justify-between", sizes.text)}>
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-medium">{value}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizes.bar)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
