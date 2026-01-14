import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSubscription } from "@/hooks/useSubscription";

interface ConfidenceMeterProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDisclaimer?: boolean;
  compact?: boolean; // Minimal view for lists
}

type ConfidenceLevel = 'high' | 'moderate' | 'low';

interface ConfidenceLevelConfig {
  level: ConfidenceLevel;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  barColor: string;
}

function getConfidenceConfig(value: number): ConfidenceLevelConfig {
  if (value >= 80) {
    return {
      level: 'high',
      label: 'High Confidence',
      description: 'Strong evidence supports halal compliance for this product.',
      color: 'text-status-halal',
      bgColor: 'bg-status-halal/10',
      barColor: 'bg-status-halal',
    };
  }
  if (value >= 50) {
    return {
      level: 'moderate',
      label: 'Moderate Confidence',
      description: 'Ingredients appear halal, but some sourcing details are unverified.',
      color: 'text-status-questionable',
      bgColor: 'bg-status-questionable/10',
      barColor: 'bg-status-questionable',
    };
  }
  return {
    level: 'low',
    label: 'Low Confidence',
    description: 'Insufficient or conflicting information to verify halal compliance.',
    color: 'text-status-not-halal',
    bgColor: 'bg-status-not-halal/10',
    barColor: 'bg-status-not-halal',
  };
}

const levelEmoji = {
  high: '🟢',
  moderate: '🟡',
  low: '🔴',
};

export function ConfidenceMeter({ 
  value, 
  className, 
  showLabel = true,
  size = 'md',
  showDisclaimer = true,
  compact = false,
}: ConfidenceMeterProps) {
  const { isPro, isClinic } = useSubscription();
  const isPremium = isPro || isClinic;
  const config = getConfidenceConfig(value);

  const sizeClasses = {
    sm: { bar: 'h-2', text: 'text-xs', gap: 'gap-1.5' },
    md: { bar: 'h-2.5', text: 'text-sm', gap: 'gap-2' },
    lg: { bar: 'h-3', text: 'text-base', gap: 'gap-2.5' },
  };

  const sizes = sizeClasses[size];

  // Compact view for use in lists
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("flex-1 h-1.5 rounded-full bg-muted overflow-hidden")}>
          <div
            className={cn("h-full rounded-full transition-all duration-300", config.barColor)}
            style={{ width: `${value}%` }}
          />
        </div>
        <span className={cn("text-xs font-medium tabular-nums", config.color)}>{value}%</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with Label and Score */}
      {showLabel && (
        <div className={cn("flex items-center justify-between", sizes.text)}>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Halal Confidence Level</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-4 space-y-3">
                  <p className="font-semibold text-sm">How is this confidence calculated?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This confidence score reflects the strength of available evidence, not absolute certainty.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">We evaluate:</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                      <li>Manufacturer ingredient disclosures</li>
                      <li>Halal certifications (if available)</li>
                      <li>Known halal or high-risk excipients</li>
                      <li>Transparency and consistency of sources</li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Some ingredients may be halal in origin but lack public sourcing confirmation.
                  </p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">
                      This tool supports informed decision-making and does not replace personal, scholarly, or medical guidance.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className={cn("font-bold tabular-nums", config.color)}>{value}%</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizes.bar)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", config.barColor)}
          style={{ width: `${value}%` }}
        />
      </div>

      {/* Dynamic Status Text */}
      <div className={cn("flex items-start gap-2 p-2.5 rounded-lg", config.bgColor)}>
        <span className="text-base leading-none mt-0.5">{levelEmoji[config.level]}</span>
        <div className="space-y-0.5 flex-1">
          <p className={cn("font-semibold text-sm", config.color)}>
            {config.label}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>

      {/* Micro-Disclaimer */}
      {showDisclaimer && (
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Confidence reflects available ingredient information and third-party verification. It is not a religious ruling (fatwa).
        </p>
      )}

      {/* Optional Pro Tier Secondary Line */}
      {isPremium && showDisclaimer && (
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          Based on ingredient disclosure, manufacturer information, and recognized halal standards.
        </p>
      )}
    </div>
  );
}
